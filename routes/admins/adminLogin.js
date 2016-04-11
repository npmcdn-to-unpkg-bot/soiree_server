/**
 * Created by shadygabal on 2/8/16.
 */

var express = require('express');
var router = express.Router();

var passport = require('passport');
var bcrypt = require('bcrypt');

var mongoose = require('app/db/mongoose_connect.js');
var Soiree = require('app/db/Soiree.js');
var Business = require('app/db/Business.js');
var User = require('app/db/User.js');
var Admin = require('app/db/Admin.js');

var ResHelper = require('app/helpers/ResHelper.js');
var DateHelper = require('app/helpers/DateHelper.js');
var ErrorCodes = require('app/helpers/ErrorCodes.js');


router.get('/', function(req, res){
    ResHelper.render(req, res, 'admins/login', { title: 'Express', stylesheets : [] });
});

router.post('/', function(req, res, next){
    passport.authenticate( 'admin', { successRedirect: '/admins/', failureRedirect: '/admins/login', failureFlash: false}, function(err, user, info){

        if (err) return next(err);
        if (!user) { return res.redirect('/admins/login'); }

        req.login(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/admins/');
        });

    })(req, res, next);
});


router.get('/createAdmin', function(req, res){
    var email = req.query.email;
    var password = req.query.password;

    var adminObj = {
        firstName : "Shady",
        lastName : "Gabal",
        phoneNumber : "3472102276"
    };

    Admin.createAdmin(adminObj, email, password, function(admin){
        res.send("Created admin: " + admin);
    }, function(err){
        res.send("Error creating admin: " + err);
    });
});


router.get('/deleteAdmins', function(req, res){
    Admin.remove({}, function(err){
        res.send("Removed admins with err: " +err);
    });
});


module.exports = router;
