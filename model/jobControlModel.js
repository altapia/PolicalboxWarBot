'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var JobControlSchema = new Schema({
  //Nombre del job
  nombre: {
    type: String,
    required: 'Nombre del job, Obligatorio'
  },
  //Indica si el job está activo
  activo: {
    type: Boolean,
    required: 'Activo, Obligatorio'
  },
  //Fecha de la última ejecución
  ultima_ejecucion:{
    type: Date
  },
  hora_inicio: {
    type: Number,
    default: 10
  },
  hora_fin: {
    type: Number,
    default: 18
  }
});

module.exports = mongoose.model('JobControl', JobControlSchema);
