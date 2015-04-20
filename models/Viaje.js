var mongoose = require('mongoose');

var ViajeSchema = new mongoose.Schema({
    author: String,
    nombre: {type: String, required: true},
    destino: String,
    fechaDeArribo: {type: Date, required: true},
    fechaDePartida: {type: Date, required: true}
    //destinos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destino' }]
});

mongoose.model('Viaje', ViajeSchema);
