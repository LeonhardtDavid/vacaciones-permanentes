var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var User = mongoose.model('User');
var Viaje = mongoose.model('Viaje');
var Translado = mongoose.model('Translado');
var Destino = mongoose.model('Destino');
var Hospedaje = mongoose.model('Hospedaje');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var router = express.Router();

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

var verifyAuthor = function (req, res, next) {
    var username = req.payload.username;
    var viaje = req.viaje;

    if (viaje.author != username) return next(new Error('no es tuyo'));

    return next();
};

var deepFill = function (req, res, next) {

    function isNew(item) { return item._id == null || item._id == undefined; }

    var bodyViaje = req.body;

    var cViaje = clone(bodyViaje);
    cViaje.destinos = [];

    var viaje = new Viaje(cViaje);
    viaje.isNew = isNew(bodyViaje);

    var destinos = [];
    var translados = {};
    var hospedajes = {};

    bodyViaje.destinos.forEach(function (destinoBody) {

        var transladoBody = destinoBody.formaDeLlegada;
        var translado = new Translado(clone(transladoBody));
        translado.isNew = isNew(transladoBody);

        var hospedajeBody = destinoBody.hospedaje;
        var hospedaje = new Hospedaje(clone(hospedajeBody));
        hospedaje.isNew = isNew(hospedajeBody);

        var destino = new Destino(clone(destinoBody));
        destino.isNew = isNew(destinoBody);
        destino.formaDeLlegada = translado;
        destino.hospedaje = hospedaje;

        var id = destino._id;

        translados[id] = translado;
        hospedajes[id] = hospedaje;

        destinos.push(destino);

    });

    req.filledViaje = viaje;
    req.destinos = destinos;
    req.translados = translados;
    req.hospedajes = hospedajes;

    return next();
};

var saveOrUpdateViaje = function (req, res, next) {
    var viaje = req.filledViaje;
    var destinos = req.destinos;

    console.log("viaje isNew? " + viaje.isNew);

    viaje.save(function (err, viaje) {
        if (err) return next(err);

        destinos.forEach(function (destino) {
            saveOrUpdateDestino(req, res, next, destino, function () {
                for (var i = 0; i < destinos.length; i++) {
                    viaje.destinos.push(destinos[i]._id)
                }

                viaje.save(function(err, viaje) {
                    if (err) return next(err);

                    res.json(viaje);
                });
            });
        });
    });
};

var saveOrUpdateDestino = function (req, res, next, destino, callback) {
    var viaje = req.filledViaje;
    var translados = req.translados;
    var hospedajes = req.hospedajes;

    destino.viaje = viaje;

    destino.save(function (err, destino) {
        if (err) return next(err);

        var id = destino._id;

        var translado = translados[id];
        translado.destino = destino;

        translado.save(function (err, translado) {
            if (err) return next(err);

            var hospedaje = hospedajes[id];
            hospedaje.destino = destino;

            hospedaje.save(function (err, hospedaje) {
                if (err) return next(err);

                callback();
            });
        });
    });
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password);

    user.save(function (err) {
        if (err) {
            return next(err);
        }

        return res.json({token: user.generateJWT()})
    });
});

router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

/* ABM Viaje */
// GET Viajes
router.get('/viajes', auth, function (req, res, next) {
    var username = req.payload.username;
    Viaje.find({author: username}, function (err, viajes) {
        if (err) {
            return next(err);
        }
        res.json(viajes);
    });
});

// POST Save viaje
router.post('/viajes', auth, deepFill, function (req, res, next) {

    var viaje = req.filledViaje;
    viaje.author = req.payload.username;

    return next();

}, saveOrUpdateViaje);

// GET Viaje
router.get('/viajes/:viaje', auth, verifyAuthor, function (req, res, next) {
    req.viaje.deepPopulate('destinos destinos.formaDeLlegada destinos.hospedaje', function (err, viaje) {
        if (err) return next(err);

        if (!viaje.destinos.length) viaje.destinos.push({});

        res.json(viaje);
    });
});

// PUT Viaje (update)
router.put('/viajes/:viaje', auth, verifyAuthor, deepFill, function (req, res, next) {

    var viajeDB = req.viaje;
    var filledViaje = req.filledViaje;

    if (viajeDB.author != filledViaje.author) return next(new Error('no es tuyo'));

    return next();

}, saveOrUpdateViaje);

// DELETE Viaje (remove)
router.delete('/viajes/:viaje', auth, verifyAuthor, function (req, res, next) {
    var viaje = req.viaje;

    viaje.remove(function (err) {
        if (err) return next(err);

        res.json({removed: "ok"});
    });
});

router.param('viaje', function (req, res, next, id) {
    var query = Viaje.findById(id);

    query.exec(function (err, viaje) {
        if (err) {
            return next(err);
        }
        if (!viaje) {
            return next(new Error('can\'t find viaje'));
        }

        req.viaje = viaje;
        return next();
    });
});

module.exports = router;

