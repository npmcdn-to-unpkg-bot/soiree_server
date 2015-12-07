/* Setup */
var mongoose = require('./mongoose_connect.js');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


/* Other Models */
var Business = require('./Business.js');
var Soiree = require('./Soiree.js');


/* Packages */
var shortid = require('shortid');

/* Schema Specific */
var genders = ["male", "female"];
var colleges = ["NYU", "Baruch"];

//var interestedIn = ["male", "female"];

var userSchema = new Schema({
	firstName : {type: String, required: true},
	lastName : {type: String},
	verified : {type: Boolean, default: false},
	pendingVerification : {type: Boolean, default: false},
	gender : {type: String, required : true, enum: genders},
	college: {type: String, enum: colleges},
	email : {type: String},
	birthday : {type: String},
	interestedIn : [{type: String, required : true, enum: genders}],
	facebookUserId : {type: String, index: true},
	profilePictureUrl : {type: String},
	userId: {type: String, unique: true, default: shortid.generate},
	phoneNumber : {type : String},
	secretKey : {type: String, index:true, unique: true, default: shortid.generate},
	finishedSignUp : {type : Boolean, default: false},
	dateSignedUp: {type : Date, default: Date.now()},
	dateLastSignedIn : {type: Date, default: Date.now()},
	location: {
		type: {type: String},
		coordinates: []
	},
	_soireesAttending: [{type: ObjectId, ref:"Soiree"}],
	_soireesAttended: [{type: ObjectId, ref:"Soiree"}],
	dateUpdated : {type: Date, default: Date.now()}
});

userSchema.index({location: '2dsphere'});

userSchema.pre('save', function(next){
	//determine age

	//set date updated
	this.dateUpdated = new Date();
	next();
});

/* Methods */

userSchema.methods.createDataObjectToSend = function(){
	var obj = {
		"firstName" : this.firstName,
		"lastName" : this.lastName,
		"gender" : this.gender,
		"email" : this.email,
		"age" : this.age,
		"birthday" : this.birthday,
		"userId" : this.userId,
		"finishedSignUp" : this.finishedSignUp,
		"interestedIn" : this.interestedIn,
		"profilePictureUrl" : this.profilePictureUrl,
		"facebookUserId" : this.facebookUserId,
		"verified" : this.verified,
		"secretKey" : this.secretKey,
		"pendingVerification" : this.pendingVerification
	};
	return obj;
};

/* Statics */

userSchema.statics.colleges = function(){
	return colleges;
};

userSchema.statics.verifyUser = function(user, successCallback, failureCallback){
	if (!user){
		console.log("No user passed to verifyUser");
		return failureCallback();
	}

	console.log("fbid " + user.facebookUserId + " userid " + user.userId + " sk " + user.secretKey);

	if (user.facebookUserId) {
		this.findOne({"facebookUserId": user.facebookUserId, "secretKey": user.secretKey}).exec(function (err, userFound) {
			if (err || !userFound) {
				console.log("User not found " + err);
				failureCallback(err);
			}
			else {
				console.log("User found " + userFound.userId);
				successCallback(userFound);
			}
		});

	}
	else if (user.userId) {
		this.findOne({"userId": user.userId, "secretKey": user.secretKey}).exec(function (err, userFound) {
			if (err || !userFound) {
				console.log("User not found " + err);
				failureCallback();
			}
			else {
				console.log("User found " + userFound);
				successCallback(userFound);
			}
		});
	}
	else {
		console.log("No fbuserid or userid");
		failureCallback();
	}
};



/* Virtuals */

userSchema.virtual('age').get(function(){
	var birthdate = new Date(this.birthday);
	var age = (Date.now() - birthdate) / (1000 * 60 * 60 * 24 * 365.25);
	return parseInt(age);
});

userSchema.virtual('fullName').get(function(){
	if (!this.lastName)
		return this.firstName;
	else if (!this.firstName)
		return this.lastName;

	return this.firstName + " " + this.lastName;
});


module.exports = mongoose.model('User', userSchema);

