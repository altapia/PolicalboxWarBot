'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var BeligeranteSchema = new Schema({
  nombre: {
    type: String,
    required: 'Nombre de la persona obligatorio'
  },
  vivo: {
    type: Boolean,
    required: 'Vivo, obligatorio',
    default: true
  },
  num_intervenciones: {
      type: Number
  },
  asesino: {
    type: Schema.Types.ObjectId, ref: 'Beligerante'
  },
  fecha_muerte: {
    type: Date
  }
});

module.exports = mongoose.model('Beligerante', BeligeranteSchema);
