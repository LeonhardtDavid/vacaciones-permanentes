var mongoose = require('mongoose');

var ViajeSchema = new mongoose.Schema({
    author: {type: String, required: true},
    nombre: {type: String, required: true, index: true},
    translados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Translado' }]
});

mongoose.model('Viaje', ViajeSchema);
