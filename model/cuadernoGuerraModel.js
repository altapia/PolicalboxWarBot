'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CuadernoGuerrachema = new Schema({
  acontecimiento: {
    type: String,
    required: 'Acontenimiento, requerido'
  },
  fecha: {
    type: Date,
    required: 'Fecha, obligatoria',
    default: Date.now
  }
});

module.exports = mongoose.model('CuadernoGuerra', CuadernoGuerrachema);
