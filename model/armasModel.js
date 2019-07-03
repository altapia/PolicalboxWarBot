'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ArmaSchema = new Schema({
  //descripción de la forma de matar con comidines:
  //Ej.: {0} mató a {1} con una piedra afilada
  descripcion: {
    type: String,
    required: 'Descripcion obligatorio'
  },
  //Id del Beligerante que puede usar este arma (opcional)
  beligerante: {
    type: Schema.Types.ObjectId, ref: 'Beligerante'
  },
  //nº de veces que ha sido usada el arma
  num_usos: {
      type: Number,
      default: 1
  },
  //-1: usos infinitos. 0: No se puede usar
  max_usos: {
      type: Number,
      default: 0
  }
});

module.exports = mongoose.model('Arma', ArmaSchema);
