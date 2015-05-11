var mongoose = require('mongoose');

var Destino = require('./Destino');

var ViajeSchema = new mongoose.Schema({
    author: {type: String, required: true},
    nombre: {type: String, required: true, index: true},
    destinos: [Destino]
});

ViajeSchema.set('versionKey', false);

mongoose.model('Viaje', ViajeSchema);
