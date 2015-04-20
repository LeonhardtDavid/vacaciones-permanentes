var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var User = mongoose.model('User');
var Viaje = mongoose.model('Viaje');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var router = express.Router();

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
router.post('/viajes', auth, function (req, res, next) {
    var viaje = new Viaje(req.body);
    viaje.author = req.payload.username;

    viaje.save(function (err, viaje) {
        if (err) {
            return next(err);
        }
        res.json(viaje);
    });
});

// GET Viaje
router.get('/viajes/:viaje', auth, function (req, res, next) {
    var username = req.payload.username;
    var viaje = req.viaje;

    if (viaje.author != username) return next(new Error('no es tuyo'));

    res.json(viaje);
});

// PUT Viaje (update)
router.put('/viajes/:viaje', auth, function (req, res, next) {
    var username = req.payload.username;
    var viajeDB = req.viaje;
    var viaje = new Viaje(req.body);

    if (viajeDB.author != username || viajeDB.author != viaje.author) return next(new Error('no es tuyo'));

    viajeDB.update(viaje.toObject(), {}, function (err, numberAffected, viaje) {
        if (err) {
            return next(err);
        }
        res.json(viaje);
    });
});

// DELETE Viaje (remove)
router.delete('/viajes/:viaje', auth, function (req, res, next) {
    var username = req.payload.username;
    var viaje = req.viaje;

    if (viaje.author != username) return next(new Error('no es tuyo'));

    viaje.remove(function (err) {
        if (err) {
            return next(err);
        }
        res.json({removed : "ok"});
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

