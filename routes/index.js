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

    var bodyViaje = req.body;

    var cViaje = clone(bodyViaje);
    cViaje.destinos = [];

    var viaje = new Viaje(cViaje);

    var destinos = [];
    var translados = {};
    var hospedajes = {};

    bodyViaje.destinos.forEach(function (destinoBody) {

        var translado = new Translado(clone(destinoBody.formaDeLlegada));
        var hospedaje = new Hospedaje(clone(destinoBody.hospedaje));
        var destino = new Destino(clone(destinoBody));
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
    var destinos = req.destinos;
    var translados = req.translados;
    var hospedajes = req.hospedajes;

    viaje.save(function (err, viaje) {
        if (err) return next(err);

        destinos.forEach(function (destino) {
            destino.viaje = viaje;
            destino.save(function (err, destino) {
                if (err) return next(err);

                var id = destino._id;

                var translado = translados[id];
                translado.destino = destino;

                translado.save(function (err, transladoS) {
                    if (err) return next(err);
                }).then(function (data) {
                    var hospedaje = hospedajes[id];
                    hospedaje.destino = destino;

                    hospedaje.save(function (err, hospedajeS) {
                        if (err) return next(err);

                        viaje.destinos = destinos;
                        viaje.update(function(err, raw) {
                            if (err) return next(err);

                            res.json(viaje);
                        });
                    });
                });
            });
        });

    });
});

// GET Viaje
router.get('/viajes/:viaje', auth, verifyAuthor, function (req, res, next) {
    req.viaje.deepPopulate('destinos destinos.formaDeLlegada destinos.hospedaje', function (err, viaje) {
        if (err) return next(err);

        // TODO eleminar, es solo por compatibilidad con los documentos ya guardados en la db
        if (!viaje.destinos.length) viaje.destinos.push({ciudad: "???"});

        res.json(viaje);
    });
});

function saveOrUpdateDestino(req, res, next, destino) {
    var filledViaje = req.filledViaje;
    var destinos = req.destinos;
    var translados = req.translados;
    var hospedajes = req.hospedajes;

    destino.viaje = filledViaje;

    if (destino._id) f = destino.update;
    else             f = destino.save;

    destino.save(function (err, raw) {
        if (err) return next(err);

        var id = destino._id;

        var translado = translados[id];
        translado.destino = destino;

        translado.save(function (err, transladoS) {
            if (err) return next(err);
        }).then(function (data) {
            var hospedaje = hospedajes[id];
            hospedaje.destino = destino;

            hospedaje.save(function (err, hospedajeS) {
                if (err) return next(err);

                for (var i = 0; i < destinos.length; i++) {
                    filledViaje.destinos.push(destinos[i]._id)
                }

                filledViaje.save(function(err, raw) {
                    if (err) return next(err);
                    res.json(filledViaje);
                });
            });
        });
    });
}

// PUT Viaje (update)
router.put('/viajes/:viaje', auth, verifyAuthor, deepFill, function (req, res, next) {
    var viajeDB = req.viaje;
    var filledViaje = req.filledViaje;
    var destinos = req.destinos;

    if (viajeDB.author != filledViaje.author) return next(new Error('no es tuyo'));

    filledViaje.isNew = false;

    filledViaje.save(function (err, raw) {
        if (err) return next(err);

        destinos.forEach(function (destino) {
            saveOrUpdateDestino(req, res, next, destino);
        });

        //res.json(viaje);
    });
});

// DELETE Viaje (remove)
router.delete('/viajes/:viaje', auth, verifyAuthor, function (req, res, next) {
    var viaje = req.viaje;

    viaje.remove(function (err) {
        if (err) {
            return next(err);
        }
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

