'use strict';
var mongoose = require('mongoose'),
GrupoTelegram = mongoose.model('GrupoTelegram');

/**
 * Busca todos los grupos de telegram
 * @param {Function} callback (grupos) 
 */
exports.find_all = function(callback) {
    let query =  GrupoTelegram.find({});
    query.sort({nombre: 1});
    query.exec(function(err, list) {
        if (err) console.error(err);
        callback(list);
    });
};

/**
 * Crea un nuevo grupo. O actualiza a Activo el exsitente
 * @param {String} chatid
 * @param {String} nombre
 * @param {Function} callback (boolean, grupo) 
 */
exports.add = function(chatid, nombre, callback) {
    GrupoTelegram.findOneAndUpdate({chatid: chatid},
        {   chatid: chatid,
            nombre: nombre,
            activo: true,
            fecha_registro: new Date()
        },
        {   new: true,
            upsert: true},
        function(err, result) {
            if (err) {
                console.error(err);
                callback(false);
            }
            callback(true);
    });
};

/**
 * Da de baja un grupo
 * @param {String} chatid
 * @param {Function} callback (boolean, grupo) 
 */
exports.baja = function(chatid, callback) {
    GrupoTelegram.findOneAndUpdate({chatid: chatid},
        {activo: false},
        {new: true},
        function(err, result) {
            if (err) {
                console.error(err);
                callback(false);
            }
            callback(true, result);
    });
};