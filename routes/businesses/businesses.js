/**
 * Created by shadygabal on 1/14/16.
 */

var express = require('express');
var router = express.Router();

var dbFolderLocation = "../../db/";
var helpersFolderLocation = "../../helpers/";

var passport = require('passport');
var bcrypt = require('bcrypt');

var mongoose = require('app/db/mongoose_connect.js');
var Soiree = require('app/db/Soiree.js');
var SoireeReservation = require('app/db/SoireeReservation.js');
var Business = require('app/db/Business.js');
var User = require('app/db/User.js');
var Admin = require('app/db/Admin.js');

var DateHelper = require('app/helpers/DateHelper.js');
var ResHelper = require('app/helpers/ResHelper.js');
var ErrorCodes = require('app/helpers/ErrorCodes.js');

var h = require('app/helpers/h');


//router.use(function(req, res, next){
    router.use(function(req, res, next){
        if (!Business.isLoggedIn(req)){
            res.redirect('/adminLogin');
        }
        else{
            if (!req.business) {
                req.business = req.user;
                if (!res.locals.business)
                    res.locals.business = req.user;
            }
            next();
        }
    });
//});

/* Everything below here will require the admin to be logged in */

router.get('/', function(req, res){

    upcomingSoireesForBusiness(req.business, function(upcomingSoirees){
        req.business.deepPopulate("_unconfirmedReservations._soiree", function(err){
            if (err){
                return res.status(404).send("Error");
            }
            ResHelper.render(req, res, 'businesses/index', {reservations : req.business._unconfirmedReservations, upcomingSoirees : upcomingSoirees});

        });
    }, function(){
       res.status(418).send("Error. Please try again.");
    });


});

function upcomingSoireesForBusiness(business, successCallback, errorCallback){
    Soiree.find({_business : business._id, date : {$gte : DateHelper.dateAtMidnightToday()}}).exec(function(err, soirees){
        if (err){
            console.log(err);
            errorCallback();
        }
        else{
            var ans = [];
            soirees = soirees.sort(function(a, b){
               return a.date.getTime() - b.date.getTime();
            });
            for (var i = 0; i < soirees.length; i++){
                var soiree = soirees[i];

                var obj = {};
                obj.soireeId = soiree.soireeId;
                obj.title = soiree.title;

                obj.numUsersRegistered = soiree._users.length;

                obj.timeString = soiree.timeString();
                ans.push(obj);
            }
            successCallback(ans);
        }
    });
}

router.get('/upcomingSoirees', function(req, res){

});

router.get('/contact', function(req, res){
    ResHelper.render(req, res, 'businesses/contact', {});
});

router.get('/history', function(req,res){
   if (req.business){
       req.business.deepPopulate("_unconfirmedReservations _confirmedReservations", function(err, business){
           if (err){
               console.log(err);
               res.status(404).send("Error. Please reload.");
           }
           else{
               ResHelper.render(req,res,'businesses/history',{business : business});
           }
       });
   }
    else{
       res.redirect('/businessLogin');
   }
});

router.get('/viewSoiree/:soireeId', function(req, res){
    var soireeId = req.params.soireeId;
    if (!soireeId) return res.status(404).send("Soiree not found");

    Soiree.findBySoireeId(soireeId, function(soiree){
        if (soiree._business._id.equals(req.business._id)){
            ResHelper.render(req, res, 'businesses/viewSoiree', {soiree : soiree});
        }
        else{
            res.status(404).send("Unauthorized");
        }
    }, function(err){
        res.status(404).send("Soiree not found");
    });
});

router.post('/confirmSoireeReservation', function(req, res){
    var confirmationCode = req.body.confirmationCode;
    console.log("Attempting to confirm " + confirmationCode);
    if (!confirmationCode){
        return res.status(404).send("Error");
    }

    confirmationCode = confirmationCode.toUpperCase();
    var responseObj = {};

    req.business.findReservationWithConfirmationCode(confirmationCode, function(reservation){
      //found reservation
        console.log("Confirming...");
        /* CONFIRM BLOCK */
        reservation.confirm(confirmationCode, function(user){
            responseObj.status = "success";

            responseObj.userFullName = user.fullName;
            responseObj.userProfilePictureUrl = user.profilePictureUrl;
            var age = (h.Globals.devOrTest) ? (user.age ? user.age : 26) : user.age;
            responseObj.userAge = age;

            responseObj.message = "Successfully confirmed reservation!";
            responseObj.userId = user.userId;

            var amountPrepaid = "$" + (reservation.amount/100).toFixed(2);
            responseObj.amountPrepaid = amountPrepaid;

            //req.flash('success', 'Successfully confirmed reservation');

            res.json(responseObj);
        }, function(error){
            if (error){
                console.log(error);
                responseObj.status = "fail";
                responseObj.message = "There was an error processing your request. Please try again.";
            }
            else{
                responseObj.status = "fail";
                responseObj.message = "Invalid Confirmation Code.";
            }

            res.json(responseObj);
        });
        /* END CONFIRM BLOCK */

    }, function(err) { //error callback for finding soirees
        console.log(err);

        if (err === ErrorCodes.NotFound) {
            responseObj.status = "fail";
            responseObj.message = "Invalid Confirmation Code.";
        }
        else {
            responseObj.status = "fail";
            responseObj.message = "There was an error processing your request. Please try again.";
        }

        res.json(responseObj);



    });

});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/businessLogin');
});


module.exports = router;
