var mongoose = require('mongoose');

var DestinoSchema = new mongoose.Schema({
  destinos: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciudad' },
  fechaArribo: String,
  fechaPartida: String,
  viaje: { type: mongoose.Schema.Types.ObjectId, ref: 'Viaje' }
});

mongoose.model('Destino', DestinoSchema);
