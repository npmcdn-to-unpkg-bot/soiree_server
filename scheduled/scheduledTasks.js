/**
 * Created by shadygabal on 12/11/15.
 */
var express = require('express');
var router = express.Router();

var dbFolderLocation = "../db/";
var helpersFolderLocation = "../helpers/";

var mongoose = require(dbFolderLocation + 'mongoose_connect.js');
var Soiree = require(dbFolderLocation + 'Soiree.js');
var SpontaneousSoireeJob = require(dbFolderLocation + 'SpontaneousSoireeJob.js');


var SOIREE_LENGTH_IN_MINS = 10;
var SPONTANEOUS_SOIREE_CHECK_BEFORE = 60;

var deepPopulateFields = "_business _usersAttending";

var scheduledTimeIdentifierNow = Soiree.createScheduledTimeIdentifier();
var scheduledTimeIdentifierPrevious = Soiree.createScheduledTimeIdentifier(Date.now() - (SOIREE_LENGTH_IN_MINS * 60 * 1000));
var scheduledTimeIdentifierReminder = Soiree.createScheduledTimeIdentifier(Date.now() - (30 * 60 * 1000));

var scheduledTimeIdentifierSpontaneous = Soiree.createScheduledTimeIdentifier(Date.now() - (SPONTANEOUS_SOIREE_CHECK_BEFORE * 60 * 1000));

console.log("Running scheduled soirees task for scheduledTimeIdentifier: " + scheduledTimeIdentifierNow +  " ...");


//start
Soiree.find( { "scheduledTimeIdentifier" : {"$lte" : scheduledTimeIdentifierNow}, "started" : false, "ended" : false, "inProgress" : false} ).deepPopulate(deepPopulateFields).exec(function(err, soirees){
    if (err){
        console.log("Error in scheduledSoirees: " + err);
    }
    else{
        console.log("Starting " + soirees.length + " soirees");
        for (var i = 0; i < soirees.length; i++){
            var soiree = soirees[i];
            console.log("Starting soiree  " + soiree.soireeId + " with users attending: " + soiree.numUsersAttending);
            soiree.start();
        }
    }
});

////update inProgress soirees
//Soiree.find( { "scheduledTimeIdentifier" : {"$gt" : scheduledTimeIdentifierPrevious, "$lt" : scheduledTimeIdentifierNow}, "started" : true, "ended" : false, "inProgress" : true} ).deepPopulate(deepPopulateFields).exec(function(err, soirees){
//    if (err){
//        console.log("Error in scheduledSoirees: " + err);
//    }
//    else{
//        console.log("Updating progress of " + soirees.length + " soirees");
//        for (var i = 0; i < soirees.length; i++){
//            var soiree = soirees[i];
//            console.log("Updating soiree " + soiree.soireeId + " with users attending: " + soiree.numUsersAttending);
//            //soiree.end();
//        }
//    }
//});

//end existing soirees

//Soiree.find( { "scheduledTimeIdentifier" : {"$lte" : scheduledTimeIdentifierPrevious}, "started" : true, "ended" : false, "inProgress" : true} ).deepPopulate(deepPopulateFields).exec(function(err, soirees){
//    if (err){
//        console.log("Error in scheduledSoirees: " + err);
//    }
//    else{
//        console.log("Ending " + soirees.length + " soirees");
//        for (var i = 0; i < soirees.length; i++){
//            var soiree = soirees[i];
//            console.log("Ending soiree  " + soiree.soireeId + " with users attending: " + soiree.numUsersAttending);
//            soiree.end();
//        }
//    }
//});


//remind people of upcoming soirees
Soiree.find( { "scheduledTimeIdentifier" : {"$lte" : scheduledTimeIdentifierReminder}, "started" : false, "ended" : false, "inProgress" : false} ).deepPopulate(deepPopulateFields).exec(function(err, soirees){
    if (err){
        console.log("Error in scheduledSoirees: " + err);
    }
    else{
        console.log("Reminding users of " + soirees.length + " soirees");
        for (var i = 0; i < soirees.length; i++){
            var soiree = soirees[i];
            console.log("Reminding soiree " + soiree.soireeId + " with users attending: " + soiree.numUsersAttending);
            soiree.remind();
        }
    }
});

SpontaneousSoireeJob.find( { "scheduledTimeIdentifier" : {"$lte" : scheduledTimeIdentifierSpontaneous}, "done" : false} ).deepPopulate(deepPopulateFields).exec(function(err, ssJobs) {
    if (err){
        console.log("SSJob Error in scheduledSoirees: " + err);
    }
    else{
        console.log("Performing ssJobs: " + ssJobs);
        for (var i = 0; i < ssJobs.length; i++){
            var ssJob = ssJobs[i];
            ssJob.perform();
        }
    }
});
//Soiree.findSoireesWithScheduledTimeIdenfitier(scheduledTimeIdentifier, function(soirees){
//
//}, function(err){
//   console.log("Error in scheduledSoirees: " + err);
//});