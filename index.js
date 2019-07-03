require('dotenv').config();
const config = require('./config.js');
var bodyParser = require('body-parser');
var express = require('express');
var moment = require('moment');
var mongoose = require('mongoose'),
  Beligerante = require('./model/beligerantesModel'), //created model loading here
  Arma = require('./model/armasModel'), //created model loading here
  CuadernoGuerra = require('./model/cuadernoGuerraModel'), //created model loading here
  JobControl = require('./model/jobControlModel'); //created model loading here

const TelegramBot = require('node-telegram-bot-api');
var schedule = require('node-schedule');
var logger = require('./config/winston');

//Se establece el Locale
moment.locale('es');

let TOKEN = config.token;
let bot = null;

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/policalboxDB', { useNewUrlParser: true }); 
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//En función de si hay url webhook se crea de una manera u otra el bot
if(typeof config.url_webhook === 'undefined'){
  // Create a bot that uses 'polling' to fetch new updates
  bot = new TelegramBot(TOKEN, {polling: true});
  logger.debug('Bot configurado por polling');
}else{
  // Create a bot that uses 'webhook' to fetch new updates
  bot = new TelegramBot(TOKEN);
  bot.setWebHook(config.url_webhook + bot.token);
  logger.debug('Bot configurado por webHook');
}

var app = express();
app.use(bodyParser.json());

app.post('/' + TOKEN, function (req, res) {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

var server = app.listen(config.listen_port, function () {
  var port = server.address().port;
  logger.info('Web server started at port ', { message: port });
});


const CHAT_ADMIN = config.chat_admin;

//Mensaje de arranque para el admin
logger.info('Inicio de la ejecución. Se envía mensaje de aviso al admin.');
bot.sendMessage(CHAT_ADMIN, '🌅 Acabo de despertar');

bot.onText(/\/echo (.+)/, echo);
bot.onText(/\/suscribir($|@.*)/, suscribir);
bot.onText(/\/baja($|@.*)/, baja);

//Comandos admin
bot.onText(/\/beligerantes($|@.*)/,(msg, match)=> {isAdmin(msg, match, beligerantes)});
bot.onText(/\/add_beligerante (.+)/,(msg, match)=> {isAdmin(msg, match, addBeligerante)});


bot.onText(/\/armas($|@.*)/,(msg, match)=> {isAdmin(msg, match, armas)});
// /add_arma_usuario -arma -usuario
bot.onText(/\/add_arma_usuario (\-.+) (\-.+)?/,(msg, match)=> {isAdmin(msg, match, addArma)});
// /add_arma -arma
bot.onText(/\/add_arma (\-.+)/,(msg, match)=> {isAdmin(msg, match, addArma)});

/**
 * Devuelve el mensaje recibido
 * @param {TelegramBot.Message} msg 
 * @param {RegExpExecArray} match 
 */
function echo(msg, match){
  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
}

/**
 * Registrar grupo para schedule
 * @param {TelegramBot.Message} msg 
 */
function suscribir(msg){
  let grupo = createObjGrupo(msg);

  if(index == -1){
    bot.sendMessage(msg.chat.id, 'Grupo suscrito correctamente.');
    bot.sendMessage(CHAT_ADMIN, 'Grupo \'' + grupo.nombre + '\' registrado');
    logger.info('Grupo registrado: ', {message: grupo.nombre});

  }else{
    bot.sendMessage(msg.chat.id, 'El grupo ya estaba registrado');
  }
}

/**
 * Elimina la suscripción a los mensajes del bot
 * @param {TelegramBot.Message} msg 
 */
function baja(msg){
  let grupo = createObjGrupo(msg);
  bot.sendMessage(msg.chat.id, 'Se ha realizado la baja de forma correcta.');
}

var beligerantesDao = require('./dao/beligerantesDAO');
var armasDao = require('./dao/armasDAO');
/**
 * Muestra una lista de beligerantes
 * @param {TelegramBot.Message} msg 
 */
function beligerantes(msg){
  var myPromise = new Promise(function(resolve, reject){
    beligerantesDao.find_all(resolve);
  });

  myPromise.then((listBeligerante) => {
    let result = 'Lista de Beligerantes\n';
    for (let i = 0; i < listBeligerante.length; i++) {
      let b = listBeligerante[i];
      
      result += '- ' + b.nombre + (b.vivo?'':'☠️')+'\n';
    }
    
    bot.sendMessage(msg.chat.id, result);
  });
}

/**
 * Añade un nuevo beligerante
 * @param {TelegramBot.Message} msg 
 * @param {RegExpExecArray} match 
 */
function addBeligerante(msg, match){
  const nombreBeligerante = match[1];

  var myPromise = new Promise(function(resolve, reject){
    beligerantesDao.add(nombreBeligerante, resolve);
  });

  myPromise.then((nuevo, beligerante) => {
    if(nuevo){
      bot.sendMessage(msg.chat.id, 'Nuevo beligerante \''+ nombreBeligerante + '\' añadido.');
    }else{
      bot.sendMessage(msg.chat.id, 'El beligerante \''+ nombreBeligerante + '\' ya existía.');
    }
  });

}

/**
 * Muestra una lista de armas
 * @param {TelegramBot.Message} msg 
 */
function armas(msg){
  var myPromise = new Promise(function(resolve, reject){
    armasDao.find_all(resolve);
  });

  myPromise.then((listArmas) => {
    let result = 'Lista de Armas\n';
    for (let i = 0; i < listArmas.length; i++) {
      let a = listArmas[i];
      result += '- ' + a.descripcion;
      if(a.beligerante!=null){
        result += ' [' + a.beligerante.nombre + ']';
      }

      result += (a.max_usos == a.num_usos?'🚫':'')
      result += '\n';
    }
    
    bot.sendMessage(msg.chat.id, result);
  });
}
/**
 * Añade un nuevo beligerante
 * @param {TelegramBot.Message} msg 
 * @param {RegExpExecArray} match 
 */
function addArma(msg, match){
  const descripcionArma = match[1].slice(1);

  let usuario;
  if(match.length>2){
    usuario = match[2].slice(1);
  }

  var myPromise = new Promise(function(resolve, reject){
    armasDao.add(descripcionArma, usuario, resolve);
  });

  myPromise.then((creado, arma) => {
    if(creado){
      bot.sendMessage(msg.chat.id, 'Nuevo arma \''+ descripcionArma + '\' añadida.');
    }else{
      bot.sendMessage(msg.chat.id, 'No se pudo crear el nuevo arma: \n\''+ descripcionArma + '\'');
    }
  });

}

/**
 * Crea un objeto con el id y el nombre del grupo o del chat
 * @param {TelegramBot.Message} msg 
 */
const createObjGrupo = (msg) => {
  let grupo= {id: msg.chat.id, nombre: ''};

  if(msg.chat.type == 'group' || msg.chat.type == 'supergroup'){
    grupo.nombre = msg.chat.title;
  }else if(msg.chat.username!=''){
    grupo.nombre = msg.chat.username;
  }else{
    grupo.nombre = msg.chat.first_name;
  }

  return grupo;
};


/**
 * Comprueba si un mensaje proviene del Admin,
 * si es así ejecuta la función callback
 * @param {TelegramBot.Message} msg 
 * @param {*} match
 * @param {*} callback 
 */
function isAdmin(msg, match, callback){
  if(msg.chat.id!=CHAT_ADMIN){
    return;
  }
  callback(msg, match);
}
