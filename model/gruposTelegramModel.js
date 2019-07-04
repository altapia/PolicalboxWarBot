'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GrupoTelegramSchema = new Schema({
  chatid: {
    type: String,
    required: 'chatid, Obligatorio'
  },
  nombre: {
    type: String,
    required: 'Nombre del grupo, Obligatorio'
  },
  //Indica si el registro del grupo está activo
  activo: {
    type: Boolean,
    required: 'Activo, Obligatorio',
    default: true
  },
  //Fecha de la última ejecución
  fecha_registro:{
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('GrupoTelegram', GrupoTelegramSchema);
