var mongoose = require('mongoose');

var CiudadSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    hospedaje: {type: mongoose.Schema.Types.ObjectId, ref: 'Hospedaje'},
    destino: {type: mongoose.Schema.Types.ObjectId, ref: 'Destino', required: true}
});

mongoose.model('Ciudad', CiudadSchema);
