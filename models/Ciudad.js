var mongoose = require('mongoose');

var CiudadSchema = new mongoose.Schema({
  nombre: String,
  destino: { type: mongoose.Schema.Types.ObjectId, ref: 'Destino' }
});

mongoose.model('Ciudad', CiudadSchema);
