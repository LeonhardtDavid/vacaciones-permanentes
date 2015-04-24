var mongoose = require('mongoose');

var DestinoSchema = new mongoose.Schema({
    ciudad: {type: mongoose.Schema.Types.ObjectId, ref: 'Ciudad', required: true},
    fechaDeArribo: {type: Date, required: true},
    fechaDePartida: {type: Date, required: true},
    translado: [{type: mongoose.Schema.Types.ObjectId, ref: 'Translado'}]
});

mongoose.model('Destino', DestinoSchema);
