var mongoose = require('mongoose');

var ViajeSchema = new mongoose.Schema({
    author: String,
    nombre: String,
    destino: String,
    fechaDeArribo: String,
    fechaDePartida: String
    //destinos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destino' }]
});

mongoose.model('Viaje', ViajeSchema);
