var mongoose = require('mongoose');

var TransladoSchema = new mongoose.Schema({
    tipo: {type: String, required: true},
    descripcion: String
});

TransladoSchema.set('versionKey', false);

//mongoose.model('Translado', TransladoSchema);
module.exports = TransladoSchema;
