var mongoose = require('mongoose');

var HospedajeSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    coordenadas: {type: [Number], index: '2d'},
    checkIn: {type: Date, required: true},
    checkOut: {type: Date, required: true},
    destino: {type: mongoose.Schema.Types.ObjectId, ref: 'Destino', required: true}
});

mongoose.model('Hospedaje', HospedajeSchema);
