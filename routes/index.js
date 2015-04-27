var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var User = mongoose.model('User');
var Viaje = mongoose.model('Viaje');
var Translado = mongoose.model('Translado');
var Destino = mongoose.model('Destino');
var Ciudad = mongoose.model('Ciudad');
var Hospedaje = mongoose.model('Hospedaje');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var router = express.Router();

var verifyAuthor = function (req, res, next) {
    var username = req.payload.username;
    var viaje = req.viaje;

    if (viaje.author != username) return next(new Error('no es tuyo'));

    return next();
};

var deepFill = function (req, res, next) {

    function fillDestino(bodyDestino, translado) {
        var destino = new Destino(bodyDestino);
        destino.translado = translado;

        var bodyCiudad = bodyDestino.ciudad;

        var ciudad = new Ciudad(bodyCiudad);
        ciudad.destino = destino;

        var bodyHospedaje = bodyCiudad.hospedaje;
        var hospedaje = new Hospedaje(bodyHospedaje);
        hospedaje.ciudad = ciudad;

        return destino;
    }

    var bodyViaje = req.body;
    var translados = [];

    bodyViaje.translados.forEach(function (bodyTranslado) {
        var translado = new Translado(bodyTranslado);

        var bodyDesde = bodyTranslado.desde;
        var bodyHasta = bodyTranslado.hasta;

        if (bodyDesde != undefined && bodyDesde.ciudad) {
            var desde = fillDestino(bodyDesde, translado);
            desde.translado = translado;
            translado.desde = desde;
        }

        // TODO tratar de sacar, esto es código duplicado
        if (bodyHasta != undefined && bodyHasta.ciudad) {
            var hasta = fillDestino(bodyHasta, translado);
            hasta.translado = translado;
            translado.hasta = hasta;
        }

        // TODO desacoplar esto
        translados.push(translado);
    });

    var viaje = new Viaje(bodyViaje);
    viaje.translados = translados;

    // de nuevo el forEach porque da error de validación (??? porque no lo da acá?)
    viaje.translados.forEach(function (translado) {
        translado.viaje = viaje;
    });

    req.filledViaje = viaje;
    req.translados = translados;

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

    viaje.save(function (err, viaje) {
        if (err) {
            return next(err);
        }
        res.json(viaje);
    });
});

// GET Viaje
router.get('/viajes/:viaje', auth, verifyAuthor, function (req, res, next) {
    req.viaje.populate('translados', function (err, viaje) {
        if (err) return next(err);

        // TODO eleminar, es solo por compatibilidad con los documentos ya guardados en la db
        if (!viaje.translados.length) viaje.translados.push({tipo: "Avión", desde: {}});

        res.json(viaje);
    });
});

// PUT Viaje (update)
router.put('/viajes/:viaje', auth, verifyAuthor, deepFill, function (req, res, next) {
    var viajeDB = req.viaje;
    var filledViaje = req.filledViaje;

    if (viajeDB.author != filledViaje.author) return next(new Error('no es tuyo'));

    viajeDB.update(filledViaje.toObject(), {}, function (err, numberAffected, viaje) {
        if (err) return next(err);

        req.translados.forEach(function (translado) {
            translado.viaje = viaje;
            translado.update(translado.toObject(), {}, function (err, numberAffected, transladoSaved) {
                if (err) return next(err);

                var desde = translado.desde;
                var hasta = translado.hasta;

                if (desde.ciudad) {
                    desde.translado = transladoSaved;
                    desde.update(desde.toObject(), {}, function (err, numberAffected, destinoSaved) {
                        if (err) return next(err);

                        var ciudad = desde.ciudad;
                        ciudad.destino = destinoSaved;
                        ciudad.update(ciudad.toObject(), {}, function (err, numberAffected, ciudadSaved) {
                            if (err) return next(err);

                            var hospedaje = ciudad.hospedaje;
                            hospedaje.ciudad = ciudadSaved;
                            hospedaje.update(hospedaje.toObject(), {}, function (err, numberAffected, hospedajeSaved) {
                                if (err) return next(err);

                            });
                        });
                    });
                }

                if (hasta.ciudad) {
                    hasta.translado = transladoSaved;
                    hasta.update(hasta.toObject(), {}, function (err, numberAffected, destinoSaved) {
                        if (err) return next(err);

                        var ciudad = hasta.ciudad;
                        ciudad.destino = destinoSaved;
                        ciudad.update(ciudad.toObject(), {}, function (err, numberAffected, ciudadSaved) {
                            if (err) return next(err);

                            var hospedaje = ciudad.hospedaje;
                            hospedaje.ciudad = ciudadSaved;
                            hospedaje.update(hospedaje.toObject(), {}, function (err, numberAffected, hospedajeSaved) {
                                if (err) return next(err);


                            });
                        });
                    });
                }

                res.json(viaje);

            });
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

