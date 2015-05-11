var mongoose = require('mongoose');

var HospedajeSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    coordenadas: {type: [Number], index: '2d'},
    checkIn: {type: Date, required: true},
    checkOut: {type: Date, required: true}
});

HospedajeSchema.set('versionKey', false);

//mongoose.model('Hospedaje', HospedajeSchema);
module.exports = HospedajeSchema;