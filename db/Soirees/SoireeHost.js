var mongoose = require('./../mongoose_connect.js');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


/* Other Models */
var Business = require('./../Business.js');
var User = require('./../User.js');
var Soiree = require('./Soiree.js');
/* Packages */
var shortid = require('shortid');
var _ = require("underscore");

/* Helper */
var helpersFolderLocation = "../../helpers/";
var DateHelper = require(helpersFolderLocation + 'DateHelper.js');
var ResHelper = require(helpersFolderLocation + 'ResHelper.js');
var CreditCardHelper = require(helpersFolderLocation + 'CreditCardHelper.js');
var LocationHelper = require(helpersFolderLocation + 'LocationHelper.js');
var PushNotificationHelper = require(helpersFolderLocation + 'PushNotificationHelper.js');
var Globals = require(helpersFolderLocation + 'Globals.js');
var io = Globals.io;

var ErrorCodes = require(helpersFolderLocation + 'ErrorCodes.js');


var customSchema = new Schema({
        _soiree : {type: ObjectId, ref: "Soiree"},
        roomId : {type: String, required: true},
        _usersJoined : [{type: ObjectId, ref: "User"}]

    },
    {timestamps: {createdAt: 'dateCreated', updatedAt: 'dateUpdated'}}
);

customSchema.virtual('').get(function () {
});


customSchema.pre("save", function (next) {
    next();
});

customSchema.post("init", function (soiree) {

});

customSchema.methods.joinUser = function(user, socket){
    console.log('a user connected to soireeInProgress. Joining room ' + this.roomId);

    socket.join(this.roomId, function (err) {
        if (err) {
            console.log("Error joining room " + roomId + " : " + err);
            socket.emit('error joining room', {roomId: roomId});
        }
        else {
            this._usersJoined.push(user._id);
            var message = user.firstName + " joined the party.";
            io.to(this.roomId).emit('joined room', message);
            this.save();

            //socket.emit('joined room', {roomId: roomId});
            //console.log("Successfully joined room " + roomId);
            //console.log("This socket's rooms: " + JSON.stringify(socket.rooms));
        }
    });

    //var message = {author: "Debug", text: "Connected to " + SOIREE_LOWERCASE};
    //socket.emit('message', message);

};



var deepPopulate = require('mongoose-deep-populate')(mongoose);
var options = {};
customSchema.plugin(deepPopulate, options);

module.exports = mongoose.model('SoireeHost', customSchema);