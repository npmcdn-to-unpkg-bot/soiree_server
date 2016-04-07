/**
 * Created by shadygabal on 12/1/15.
 */

var express = require('express');
var router = express.Router();

var dbFolderLocation = "../../db/";
var helpersFolderLocation = "../../helpers/";

var mongoose = require(dbFolderLocation + 'mongoose_connect.js');
var fs = require('fs');

var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var Soiree = require(dbFolderLocation + 'Soirees/Soiree.js');
var Business = require(dbFolderLocation + 'Business.js');
var User = require(dbFolderLocation + 'User.js');
var Image = require(dbFolderLocation + 'Image.js');

var UserVerification = require(dbFolderLocation + 'UserVerification.js');

var EmailHelper = require(helpersFolderLocation + 'EmailHelper.js');
var DateHelper = require(helpersFolderLocation + 'DateHelper.js');
var ResHelper = require(helpersFolderLocation + 'ResHelper.js');
var ErrorCodes = require(helpersFolderLocation + 'ErrorCodes.js');

router.post('/sendVerificationEmail', function(req, res, next){
    User.verifyUser(req, res, next, function(user){
        var email = req.body.email;
        console.log('verified user, sending email...');

        if (EmailHelper.validateEmail(email)){
            user.email = email;
            user.save();
            EmailHelper.sendVerificationEmail(email, user, function(){
                ResHelper.sendSuccess(res);
            }, function(err){
                ResHelper.sendError(res, ErrorCodes.Error);
            });
        }
        else{
            ResHelper.sendError(res, ErrorCodes.InvalidInput);
        }

    }, function(err){
        console.log('error verifying user, not sending email... ' + err);

        ResHelper.sendMessage(res, ErrorCodes.UserVerificationError);
    });
});

router.get('/sendVerificationEmail', function(req, res){
        var email = req.query.email;

        if (EmailHelper.validateEmail(email)){
            EmailHelper.sendVerificationEmail(email, null, function(){
                ResHelper.sendMessage(res, 200, "email sent");
            }, function(err){
                ResHelper.sendMessage(res, 404, "error sending email");
            });
        }
        else{
            ResHelper.sendMessage(res, 418, "email invalid");
        }
});

router.post('/verifyCode', function(req, res, next){
   User.verifyUser(req, res, next, function(user) {
       if (!req.body.code) ResHelper.sendError(ErrorCodes.MissingData);

       if (user.verifyCode(req.body.code) || user.verified) {
           user.verified = true;
           user.save();
           ResHelper.sendSuccess(res);
       }
       else{
           ResHelper.sendError(ErrorCodes.InvalidInput);
       }

   });
});

router.get('/verificationPhoto', function(req, res){
    var userId = req.query.userId;

    User.findOne({"userId" : userId}).exec(function(err, user){
        if (err){
            res.status('404').send("Error fetching user");
        }
        else if (!user){
            res.status('404').send("No user found");
        }
        else{
            UserVerification.findOne({_user : user._id}).exec(function(err, verification){
                if (err){
                    res.status('404').send("Error finding verification");
                }
                else if (!verification){
                    res.status('404').send("No verification found");
                }
                else{
                    if (verification.image){
                        res.send("verification has image");
                    }
                    else res.send("verification has no image");
                }
            });
        }

    });
});

router.get('/deleteVerifications', function(req, res){
    UserVerification.remove({}, function(){
        res.send("Done");
    });
});


//var cpUpload = ;
router.post('/uploadVerification', upload.fields([{ name: 'id', maxCount: 1 }, { name: 'self', maxCount: 1 }]) , function(req, res, next){
    User.verifyUser(req, res, next, function(user) {
        if (!user.verified) {

            var idImageFile = req.files["id"][0];
            var selfImageFile = req.files["self"][0];

            if (!idImageFile || !selfImageFile){
                console.log("Missing idImage or selfImage");
                return ResHelper.sendError(res, ErrorCodes.MissingData);
            }


            UserVerification.remove({_user: user._id}, function(err){

                //if (err) {
                //    return res.status('404').send("Error removing old copies");
                //}
                var notes = req.body.notes;
                var college = req.body.college;

                var userVerification = new UserVerification({
                    _user: user._id,
                    notes : notes,
                    college : college
                });

                var directory = "/images/";
                var fileNameSuffix = user.userId + "_" + Date.now();
                var selfFileName = "self_" + fileNameSuffix;
                var idFileName = "id_" + fileNameSuffix;


                var idImage = new Image({
                    data : idImageFile.buffer,
                    contentType : idImageFile.mimetype,
                    fileName : idFileName,
                    directory: directory,
                    path : Image.createPath(directory, idFileName),
                    adminsOnly: true,
                    _userVerification : userVerification._id
                });
                idImage.save();

                var selfImage = new Image({
                    data : selfImageFile.buffer,
                    contentType : selfImageFile.mimetype,
                    fileName : selfFileName,
                    directory: directory,
                    path : Image.createPath(directory, selfFileName),
                    adminsOnly : true,
                    _userVerification : userVerification._id
                });
                selfImage.save();

                userVerification.idImage = idImage._id;
                userVerification.selfImage = selfImage._id;

                userVerification.idImagePath = idImage.path;
                userVerification.selfImagePath = selfImage.path;

                userVerification.save(function (err, doc) {
                    if (err) {
                        console.log("Error saving user verification: " + err);
                        selfImage.remove();
                        idImage.remove();
                        ResHelper.sendError(res, ErrorCodes.ErrorSaving);
                    }
                    else {
                        console.log("doc.idimage " + doc.idImage);
                        console.log("saved userverification with idpath : " + doc.idImagePath + " selfpath : " + doc.selfImagePath);
                        ResHelper.sendSuccess(res);
                    }
                });

            });
        }
        else{
            ResHelper.sendMessage(res, 200, "user already verified");
        }

    });
});

module.exports = router;
