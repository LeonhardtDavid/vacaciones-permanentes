var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var User = mongoose.model('User');
var Viaje = mongoose.model('Viaje');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var router = express.Router();

var verifyAuthor = function (req, res, next) {
    var username = req.payload.username;
    var viaje = req.viaje;

    if (viaje.author != username) return next(new Error('no es tuyo'));

    return next();
};

var checkNew = function (req, res, next) {

    var bodyViaje = req.body;
    var isNew = bodyViaje._id === null || bodyViaje._id === undefined;

    var viaje = new Viaje(bodyViaje);
    viaje.isNew = isNew;

    req.chekedViaje = viaje;

    return next();
};

var saveOrUpdateViaje = function (req, res, next) {
    req.chekedViaje.save(function (err, viaje) {
        if (err) return next(err);

        res.json(viaje);
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

        return res.json({token: user.generateJWT()});
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
        if (err) return next(err);

        res.json(viajes);
    });
});

// POST Save viaje
router.post('/viajes', auth, checkNew, function (req, res, next) {

    var viaje = req.chekedViaje;
    viaje.author = req.payload.username;

    return next();

}, saveOrUpdateViaje);

// GET Viaje
router.get('/viajes/:viaje', auth, verifyAuthor, function (req, res, next) {
    req.viaje.populate('destinos', function (err, viaje) {
        if (err) return next(err);

        if (!viaje.destinos.length) viaje.destinos.push({});

        res.json(viaje);
    });
});

// PUT Viaje (update)
router.put('/viajes/:viaje', auth, verifyAuthor, checkNew, function (req, res, next) {

    var viajeDB = req.viaje;
    var filledViaje = req.chekedViaje;

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

