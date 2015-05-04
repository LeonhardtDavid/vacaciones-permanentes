var mongoose = require('mongoose');

var TransladoSchema = new mongoose.Schema({
    tipo: {type: String, required: true},
    descripcion: String,
    destino: {type: mongoose.Schema.Types.ObjectId, ref: 'Destino'}
});

TransladoSchema.set('versionKey', false);

mongoose.model('Translado', TransladoSchema);
