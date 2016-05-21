/**
 * Created by shadygabal on 12/3/15.
 */
var express = require('express');
var router = express.Router();

//var dbFolderLocation = "../../db/";
//var helpersFolderLocation = "../../helpers/";
//var assetsFolderLocation = "../../assets/";

var mongoose = require('app/db/mongoose_connect.js');
var fs = require('fs');
var path = require('path');
var multer = require('multer');


var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var Soiree = require('app/db/Soiree.js');
var Business = require('app/db/Business.js');
var User = require('app/db/User.js');
var UserVerification = require('app/db/UserVerification.js');
var CommunityPost = require('app/db/CommunityPost.js');
var CommunityComment = require('app/db/CommunityComment.js');

var DateHelper = require('app/helpers/DateHelper.js');
var LocationHelper = require('app/helpers/LocationHelper.js');
var ResHelper = require('app/helpers/ResHelper.js');
var ErrorCodes = require('app/helpers/ErrorCodes.js');




/* Posts */

router.get('/posts', function(req, res){
    //User.verifyUser(req.body.user, function(user){
        //var longitude = req.body.user.longitude;
        //var latitude = req.body.user.latitude;
        //var coors = {type: "Point", coordinates: [longitude, latitude]};

        CommunityPost.find({}).exec(function(err, posts){
           if (err){
               res.status('404').send("Error finding posts");
           }
           else{
               var jsonArray = [];
               for (var i = 0;i < posts.length; i++){
                   jsonArray.push(posts[i].jsonObject);
               }
               res.json({"posts" : jsonArray});
           }
        });

});

router.post('/posts', function(req, res, next){
    /* Possible Error Codes:
        ErrorQuerying
     */

    User.verifyUser(req, res, next, function(user){

        var longitude = req.body.user.longitude;
        var latitude = req.body.user.latitude;
        var coors = LocationHelper.createPoint(longitude, latitude);

        CommunityPost.findPosts(req, coors, user, function (posts) {

            var jsonArray = [];
            for (var i = 0; i < posts.length; i++) {
                var post = posts[i];
                var jsonObject = post.jsonObject(user);

                jsonArray.push(jsonObject);
            }
            res.json({"posts": jsonArray});

        }, function (err) {
            ResHelper.sendError(res, err);
        });


    }, function(err){
        ResHelper.sendError(res, err);
    });

});

router.post('/postsForUser', function(req, res, next){
    /* Possible Error Codes:
     ErrorQuerying
     */

    User.verifyUser(req, res, next, function(user){

        var userId = req.body.userId;

        CommunityPost.findPostsForUserId(userId, function (posts) {

            var jsonArray = [];
            for (var i = 0; i < posts.length; i++) {
                var post = posts[i];
                var jsonObject = post.jsonObject(user);

                jsonArray.push(jsonObject);
            }
            res.json({"posts": jsonArray});

        }, function (err) {
            ResHelper.sendError(res, err);
        });

    }, function(err){
        ResHelper.sendError(res, err);
    });

});

router.post('/postWithPostId', function(req, res, next){
   User.verifyUser(req, res, next, function(user){
       var postId = req.body.postId;
       if (!postId)
        return ResHelper.sendError(res, ErrorCodes.MissingData);

       CommunityPost.findPostWithId(postId, function(post){
           res.json(post.jsonObject(user, true));
       }, function(err){
          ResHelper.sendError(res, err);
       });
   });
});


router.post('/createPost', function(req, res, next){
    console.log('creating post...');
    User.verifyUser(req, res, next, function(user){
        console.log("verified user");
        var longitude = req.body.user.longitude;
        var latitude = req.body.user.latitude;

        var coors = LocationHelper.createPoint(longitude, latitude);

        var text = req.body.post;

        CommunityPost.createPost({
            "location" : coors,
            "text" : text
        }, user, function(post){
            console.log("user created");
            res.json(post.jsonObject(user));
        }, function(err){
            ResHelper.sendError(res, ErrorCodes.MongoError);
        });

    }, function(err){
        ResHelper.sendMessage(res, 404, "error finding user: " + err);
    });
});

router.post('/updatePost', function(req, res, next){
    User.verifyUser(req, res, next, function(user){
       var postId = req.body.postId;
       if (!postId) {
           return ResHelper.sendMessage(res, 418, "no post id: " + err);
       }

       CommunityPost.findPostWithId(postId, function(post){
           res.json(post.jsonObject(user));
       }, function(err) {
           ResHelper.sendMessage(res, 404, "error finding post: " + err);
       });

   }, function(err){
       ResHelper.sendMessage(res, 404, "error finding user: " + err);
   });
});
                                    /* Comments */

router.post('/createComment', function(req, res, next){
    User.verifyUser(req, res, next, function(user){
        var text = req.body.comment;
        var postId = req.body.postId;

        console.log("Finding post with postId: " + postId);
        CommunityPost.findOne({postId : postId}, function(err, post){
            if (err || !post){
                ResHelper.sendMessage(res, 404, "error finding post: " + err);
            }
            else{
                post.addComment({
                    text : text
                }, user, function(comment){
                    res.json({"comment" : comment.jsonObject(user)});
                    //ResHelper.sendMessage(res, 200, "created comment");
                }, function(err){
                    console.log(err);
                    ResHelper.sendError(res, err);
                });
            }
        });

    }, function(err){
        ResHelper.sendMessage(res, 404, "error finding user: " + err);
    });
});



                                /* Emotioning/Unemotioning */

router.post('/uploadEmotionForPost', function(req, res, next){
    User.verifyUser(req, res, next, function(user){
        var emotion = req.body.emotion;
        var postId = req.body.postId;

        if (emotion && postId) {

            CommunityPost.findOne({postId: postId}, function (err, post) {
                if (err || !post) {
                    ResHelper.sendMessage(res, 404, "error finding post: " + err);
                }
                else {

                    post.emotion(user, emotion, function (_post) {
                        ResHelper.sendSuccess(res);
                    }, function (err) {
                        console.log(err);
                        ResHelper.sendError(res, ErrorCodes.ErrorQuerying);
                    });

                }
            });
        }
    });
});

router.post('/uploadUnemotionForPost', function(req, res, next){
    User.verifyUser(req, res, next, function(user){
        var emotion = req.body.emotion;
        var postId = req.body.postId;

        if (emotion && postId) {

            CommunityPost.findOne({postId: postId}, function (err, post) {
                if (err || !post) {
                    ResHelper.sendMessage(res, 404, "error finding post: " + err);
                }
                else {

                    post.unemotion(user, emotion, function (_post) {
                        ResHelper.sendSuccess(res);
                    }, function (err) {
                        console.log(err);
                        ResHelper.sendError(res, ErrorCodes.ErrorQuerying);
                    });

                }
            });
        }
    });

});


router.post('/uploadEmotionForComment', function(req, res, next){
    User.verifyUser(req, res, next, function(user){
        var emotion = req.body.emotion;
        var commentId = req.body.commentId;

        if (emotion && commentId) {

            CommunityComment.findOne({commentId: commentId}, function (err, comment) {
                if (err || !comment) {
                    ResHelper.sendMessage(res, 404, "error finding post: " + err);
                }
                else {

                    comment.emotion(user, emotion, function (_comment) {
                        ResHelper.sendSuccess(res);
                    }, function (err) {
                        console.log(err);
                        ResHelper.sendError(res, ErrorCodes.ErrorQuerying);
                    });

                }
            });
        }
    });
});

router.post('/uploadUnemotionForComment', function(req, res, next){
    User.verifyUser(req, res, next, function(user){
        var emotion = req.body.emotion;
        var commentId = req.body.commentId;

        if (emotion && commentId) {

            CommunityComment.findOne({commentId: commentId}, function (err, comment) {
                if (err || !comment) {
                    ResHelper.sendMessage(res, 404, "error finding post: " + err);
                }
                else {

                    comment.unemotion(user, emotion, function (_comment) {
                        ResHelper.sendSuccess(res);
                    }, function (err) {
                        console.log(err);
                        ResHelper.sendError(res, ErrorCodes.ErrorQuerying);
                    });

                }
            });
        }
    });

});


module.exports = router;
