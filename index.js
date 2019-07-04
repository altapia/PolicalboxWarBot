process.env.NTBA_FIX_319 = 1;
const config = require('./config.js');
var bodyParser = require('body-parser');
var express = require('express');
var moment = require('moment');
var mongoose = require('mongoose'),
  Beligerante = require('./model/beligerantesModel'), //created model loading here
  Arma = require('./model/armasModel'), //created model loading here
  CuadernoGuerra = require('./model/cuadernoGuerraModel'), //created model loading here
  JobControl = require('./model/jobControlModel'), //created model loading here
  GrupoTelegram = require('./model/gruposTelegramModel'); //created model loading here

const TelegramBot = require('node-telegram-bot-api');
var schedule = require('node-schedule');
var logger = require('./config/winston');

//Se establece el Locale
moment.locale('es');

let TOKEN = config.token;
let bot = null;

// mongoose instance connection url connection
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/policalboxDB', { useNewUrlParser: true, useFindAndModify: false  }); 
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

  //Se crea el servidor web para escuchar las peticiones de Telegram por Webhook
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
}


const CHAT_ADMIN = config.chat_admin;

//Mensaje de arranque para el admin
logger.info('Inicio de la ejecución. Se envía mensaje de aviso al admin.');
bot.sendMessage(CHAT_ADMIN, '🌅 Acabo de despertar');

//Comandos del bot
var command = require('./commands/generales.js');
command.botTelegram(bot);

bot.onText(/\/echo (.+)/, command.echo);
bot.onText(/\/suscribir($|@.*)/, command.suscribir);
bot.onText(/\/baja($|@.*)/, command.baja);

//Comandos admin
bot.onText(/\/grupos($|@.*)/,(msg, match)=> {isAdmin(msg, match, command.grupos)});
bot.onText(/\/beligerantes($|@.*)/,(msg, match)=> {isAdmin(msg, match, command.beligerantes)});
bot.onText(/\/add_beligerante (.+)/,(msg, match)=> {isAdmin(msg, match, command.addBeligerante)});

bot.onText(/\/armas($|@.*)/,(msg, match)=> {isAdmin(msg, match, command.armas)});
// /add_arma_usuario -arma -usuario
bot.onText(/\/add_arma_usuario (\-.+) (\-.+)?/,(msg, match)=> {isAdmin(msg, match, command.addArma)});
// /add_arma -arma
bot.onText(/\/add_arma (\-.+)/,(msg, match)=> {isAdmin(msg, match, command.addArma)});



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
