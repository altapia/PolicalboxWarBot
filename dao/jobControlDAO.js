'use strict';
var mongoose = require('mongoose'),
    JobControl = mongoose.model('JobControl');

/**
 * Busca todos los Jobs
 * @param {function} callback
 */
exports.find_all = function (callback) {
    let query = JobControl.find({});
    query.sort({ nombre: 1 });
    query.exec(callback);
};

/**
 * Busca un job por su nombre
 * @param {String} nombre
 * @param {Boolean} activo
 * @param {function} callback
 */
exports.findByNombre = function (nombre, callback) {
    JobControl.findOne({ 'nombre': { '$eq': nombre } }, function(err, result){
        if (err) {
            console.error(err);
            callback(null);
        }
        callback(result);
    });
};

/**
 * Crea un nuevo job
 * @param {String} nombre
 * @param {Boolean} activo
 * @param {function} callback
 */
exports.create = function (nombre, activo, callback) {
    let new_jobControl = new JobControl();
    new_jobControl.nombre = nombre;
    new_jobControl.activo = activo;
    new_jobControl.hora_inicio = 10;
    new_jobControl.hora_fin = 18;
    new_jobControl.save(callback);
};

/**
 * Actualiza el estado (Activo o no) del job
 * @param {String} nombre
 * @param {Boolean} activo
 * @param {function} callback
 */
exports.updateActivo = function (nombre, activo, callback) {
    JobControl.findOneAndUpdate({ 'nombre': { '$eq': nombre } }, { $set: { 'activo': activo } }, { new: true }, function(err, result){
        if (err) {
            console.error(err);
            callback(null);
        }
        callback(result);
    });
};

/**
 * Actualiza la fecha de última ejecución
 * @param {String} nombre
 * @param {Date} ultEjecucion
 * @param {function} callback
 */
exports.updateUltEjecucion = function (nombre, ultEjecucion, callback) {
    JobControl.findOneAndUpdate({ 'nombre': { '$eq': nombre } }, { $set: { 'ultima_ejecucion': ultEjecucion } }, { new: true }, function(err, result){
        if (err) {
            console.error(err);
            callback(null);
        }
        callback(result);
    });
};
