var mongoose = require('mongoose');

var TransladoSchema = new mongoose.Schema({
    tipo: {type: String, required: true},
    desde: {type: mongoose.Schema.Types.ObjectId, ref: 'Destino'},
    hasta: {type: mongoose.Schema.Types.ObjectId, ref: 'Destino'},
    viaje: {type: mongoose.Schema.Types.ObjectId, ref: 'Viaje', required: true}
});

mongoose.model('Translado', TransladoSchema);
