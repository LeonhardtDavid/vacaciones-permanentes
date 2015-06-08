var mongoose = require('mongoose');

var DestinoSchema = new mongoose.Schema({
    ciudad: {type: String, required: true},
    fechaDeArribo: {type: Date, required: true},
    fechaDePartida: {type: Date, required: true},
    coordenadas: {type: [Number], index: '2d'},
    hospedaje: {
        nombre: {type: String, required: true},
        coordenadas: {type: [Number], index: '2d'},
        direccion: String,
        telefono: String,
        icono: String,
        checkIn: {type: Date, required: true},
        checkOut: {type: Date, required: true}
    },
    formaDeLlegada: {
        tipo: {type: String, required: true},
        descripcion: String
    }
});

DestinoSchema.set('versionKey', false);

//mongoose.model('Destino', DestinoSchema);
module.exports = DestinoSchema;