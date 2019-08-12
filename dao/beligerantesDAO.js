'use strict';
var mongoose = require('mongoose'),
Beligerante = mongoose.model('Beligerante');

/**
 * Busca todos los Beligerantes
 */
exports.find_all = function(callback) {
    let query =  Beligerante.find({});
    query.sort({nombre: 1});
    query.exec(function(err, listBeligerantes) {
        if (err) console.error(err);
        callback(listBeligerantes);
    });
};

/**
 * Busca todos los vivos
 */
exports.find_vivos = function(callback) {
    let query =  Beligerante.find({vivo: {$eq: true}});
    query.sort({nombre: 1});
    query.exec(function(err, listBeligerantes) {
        if (err) console.error(err);
        callback(listBeligerantes);
    });
};

/**
 * Busca todos los vivos
 * @param {Function} callback
 * @param {String} noId Id que se excluirá del random
 */
exports.find_random_vivo = function(callback, noId) {
    let query ;
    if(typeof noId !== 'undefined'){
        query =  Beligerante.aggregate([{$match: {vivo: true}}, {$match: {_id:{$ne: noId}}},{$sample: {size:1}}]);
    }else{
        query =  Beligerante.aggregate([{$match: {vivo: true}},{$sample: {size:1}}]);
    }
    query.exec(function(err, beligerante) {
        if (err) console.error(err);
        callback(beligerante);
    });
};

/**
 * Actualiza el nº de actuaciones del beligerante asesino,
 * Actualiza el estado Vivo a false del beligerante muerto
 */
exports.mata = function(idAsesino, idMuerto, callback){
    Beligerante.findOneAndUpdate({_id: idAsesino}, {$inc: {'num_intervenciones':1}}, {new: false}, function(err, asesino) {
        if (err) console.error(err);
        Beligerante.findOneAndUpdate({_id: idMuerto}, {$set: {'vivo': false, 'asesino': idAsesino, 'fecha_muerte': new Date()}}, {new: false}, function(err, muerto) {
            if (err) console.error(err);
            callback();
        });
    });
}

/**
 * Crea un nuevo beligerante
 * @param {String} nombre
 * @param {Function} callback
 */
exports.add = function(nombre, callback) {
    let query =  Beligerante.findOne({nombre: {$eq: nombre}});
    query.exec(function(err, beligerante) {
        if (err) console.error(err);
        if(beligerante == null){
            var new_beligerante = new Beligerante();
            new_beligerante.nombre = nombre;

            new_beligerante.save(function(err, result) {
                if (err) console.error(err);
                callback(true);
            });

        }else{
            callback(false);
        }
    });
};