var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var ViajeSchema = new mongoose.Schema({
    author: {type: String, required: true},
    nombre: {type: String, required: true, index: true},
    destinos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destino' }]
});

ViajeSchema.plugin(deepPopulate, {
    whitelist: [
        'destinos.formaDeLlegada',
        'destinos.hospedaje'
    ]
});

mongoose.model('Viaje', ViajeSchema);
