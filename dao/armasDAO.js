'use strict';
var mongoose = require('mongoose'),
Arma = mongoose.model('Arma'),
Beligerante = mongoose.model('Beligerante');

/**
 * Busca todos los Beligerantes
 */
exports.find_all = function(callback) {
    let query =  Arma.find({});
    query.sort({beligerante: 1});
    query.populate('beligerante');
    query.exec(function(err, listArmas) {
        if (err) console.error(err);
        callback(listArmas);
    });
};

/**
 * Crea un nuevo beligerante
 * @param {String} descripcion
 * @param {String} usuario Nombre del Beligerante que puede usar el arma o null
 * @param {Function} callback (boolean, arma) 
 */
exports.add = function(descripcion, usuario, callback) {
    if(usuario == null){
        var new_arma = new Arma();
        new_arma.descripcion = descripcion;
        new_arma.max_usos = 1; //Se inicializa a 1 uso máximo.
        new_arma.num_usos = 0;

        new_arma.save(function(err, result) {
            if (err) {
                console.error(err);
                callback(false);
            }
            callback(true);
        });
    }else{
        let query =  Beligerante.findOne({nombre: {$eq: usuario}});
        query.exec(function(err, beligerante) {
            if (err){
                console.error(err);
                callback(false);
            }
            if(beligerante == null){
                callback(false);
            }else{
                var new_arma = new Arma();
                new_arma.descripcion = descripcion;
                new_arma.beligerante = beligerante._id;
                new_arma.max_usos = 1; //Se inicializa a 1 uso.

                new_arma.save(function(err, result) {
                    if (err) console.error(err);
                    callback(true);
                });
            }
        });

    }

};