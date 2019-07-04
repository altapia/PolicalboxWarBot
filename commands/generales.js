'use strict';

const config = require('../config.js');
var logger = require('../config/winston');

var beligerantesDao = require('../dao/beligerantesDAO');
var armasDao = require('../dao/armasDAO');
var grupoTelegramDao = require('../dao/gruposTelegramDAO');


const CHAT_ADMIN = config.chat_admin;
let bot;
exports.botTelegram = function (b) {
    bot = b;
}

/**
* Devuelve el mensaje recibido
* @param {TelegramBot.Message} msg 
* @param {RegExpExecArray} match 
*/
exports.echo = function (msg, match) {
    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
}


/**
 * Registrar grupo para schedule
 * @param {TelegramBot.Message} msg 
 */
exports.suscribir = function (msg) {
    let grupo = createObjGrupo(msg);

    var myPromise = new Promise(function (resolve, reject) {
        grupoTelegramDao.add(grupo.id, grupo.nombre, resolve);
    });

    myPromise.then((creado) => {
        if (creado) {
            bot.sendMessage(msg.chat.id, 'Grupo suscrito correctamente.');
            bot.sendMessage(CHAT_ADMIN, 'Grupo \'' + grupo.nombre + '\' registrado');
            logger.info('Grupo registrado: ', { message: grupo.nombre });
        } else {
            bot.sendMessage(msg.chat.id, 'No se pudo registrar el grupo');
        }
    });

}

/**
 * Elimina la suscripción a los mensajes del bot
 * @param {TelegramBot.Message} msg 
 */
exports.baja = function (msg) {
    let grupo = createObjGrupo(msg);
    var myPromise = new Promise(function (resolve, reject) {
        grupoTelegramDao.baja(grupo.id, resolve);
    });

    myPromise.then((actualizado) => {
        if (actualizado) {
            bot.sendMessage(msg.chat.id, 'Se ha realizado la baja de forma correcta.');
            bot.sendMessage(CHAT_ADMIN, 'Grupo \'' + grupo.nombre + '\' dado de baja');
            logger.info('Grupo dado de baja: ', { message: grupo.nombre });
        } else {
            bot.sendMessage(msg.chat.id, 'No se ha podido realizar la baja.');
        }
    });
}


/**
 * Muestra una lista de grupos
 * @param {TelegramBot.Message} msg 
 */
exports.grupos = function (msg) {
    var myPromise = new Promise(function (resolve, reject) {
        grupoTelegramDao.find_all(resolve);
    });

    myPromise.then((list) => {
        let result = 'Lista de grupos\n';
        for (let i = 0; i < list.length; i++) {
            let gr = list[i];
            result += '- ' + gr.nombre;
            result += (gr.activo ? '' : '❌')
            result += '\n';
        }

        bot.sendMessage(msg.chat.id, result);
    });
}


/**
 * Muestra una lista de beligerantes
 * @param {TelegramBot.Message} msg 
 */
exports.beligerantes = function (msg) {
    var myPromise = new Promise(function (resolve, reject) {
        beligerantesDao.find_all(resolve);
    });

    myPromise.then((listBeligerante) => {
        let result = 'Lista de Beligerantes\n';
        for (let i = 0; i < listBeligerante.length; i++) {
            let b = listBeligerante[i];

            result += '- ' + b.nombre + (b.vivo ? '' : '☠️') + '\n';
        }

        bot.sendMessage(msg.chat.id, result);
    });
}

/**
 * Añade un nuevo beligerante
 * @param {TelegramBot.Message} msg 
 * @param {RegExpExecArray} match 
 */
exports.addBeligerante = function (msg, match) {
    const nombreBeligerante = match[1];

    var myPromise = new Promise(function (resolve, reject) {
        beligerantesDao.add(nombreBeligerante, resolve);
    });

    myPromise.then((nuevo) => {
        if (nuevo) {
            bot.sendMessage(msg.chat.id, 'Nuevo beligerante \'' + nombreBeligerante + '\' añadido.');
        } else {
            bot.sendMessage(msg.chat.id, 'El beligerante \'' + nombreBeligerante + '\' ya existía.');
        }
    });
}

/**
 * Muestra una lista de armas
 * @param {TelegramBot.Message} msg 
 */
exports.armas = function (msg) {
    var myPromise = new Promise(function (resolve, reject) {
        armasDao.find_all(resolve);
    });

    myPromise.then((listArmas) => {
        let result = 'Lista de Armas\n';
        for (let i = 0; i < listArmas.length; i++) {
            let a = listArmas[i];
            result += '- ' + a.descripcion;
            if (a.beligerante != null) {
                result += ' [' + a.beligerante.nombre + ']';
            }

            result += (a.max_usos == a.num_usos ? '🚫' : '')
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
exports.addArma = function (msg, match) {
    const descripcionArma = match[1].slice(1);

    let usuario;
    if (match.length > 2) {
        usuario = match[2].slice(1);
    }

    var myPromise = new Promise(function (resolve, reject) {
        armasDao.add(descripcionArma, usuario, resolve);
    });

    myPromise.then((creado) => {
        if (creado) {
            bot.sendMessage(msg.chat.id, 'Nuevo arma \'' + descripcionArma + '\' añadida.');
        } else {
            bot.sendMessage(msg.chat.id, 'No se pudo crear el nuevo arma: \n\'' + descripcionArma + '\'');
        }
    });

}

/**
* Crea un objeto con el id y el nombre del grupo o del chat
* @param {TelegramBot.Message} msg 
*/
const createObjGrupo = (msg) => {
    let grupo = { id: msg.chat.id, nombre: '' };

    if (msg.chat.type == 'group' || msg.chat.type == 'supergroup') {
        grupo.nombre = msg.chat.title;
    } else if (msg.chat.username != '') {
        grupo.nombre = msg.chat.username;
    } else {
        grupo.nombre = msg.chat.first_name;
    }

    return grupo;
};
