var mongoose = require('mongoose');

var DestinoSchema = new mongoose.Schema({
    ciudad: {type: String, required: true},
    fechaDeArribo: {type: Date, required: true},
    fechaDePartida: {type: Date, required: true},
    hospedaje: {type: mongoose.Schema.Types.ObjectId, ref: 'Hospedaje'},
    formaDeLlegada: {type: mongoose.Schema.Types.ObjectId, ref: 'Translado'},
    viaje: {type: mongoose.Schema.Types.ObjectId, ref: 'Viaje'}
});

mongoose.model('Destino', DestinoSchema);
