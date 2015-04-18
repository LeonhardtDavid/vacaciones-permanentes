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

/*ABM Viaje*/
//GET Viaje
router.get('/viajes', auth, function (req, res, next) {
    var username = req.payload.username;
    Viaje.find({author : username}, function (err, viajes) {
        if (err) {
            return next(err);
        }
        res.json(viajes);
    });
});

//POST Save viaje
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

module.exports = router;

