var func = function(){

    console.log("running soireeCreator...");

    var dbFolderLocation = "../db/";
    var helpersFolderLocation = "../helpers/";

    var Soiree = require('app/db/Soiree.js');
    var Globals = require('app/helpers/Globals.js');

    var numToCreatePerType = {
      "lunch" : 2, "dinner" : 2, "drinks" : 2, "blind date" : 2
    };

    for (var i = 0; i < Globals.soireeTypes.length; i++){
        var soireeType = Globals.soireeTypes[i];

        var numToCreate = numToCreatePerType[soireeType];
        if (numToCreate){
            for (var j = 0; j < numToCreate; j++){
                for (var k = 0; k < Globals.colleges.length; k++){
                    var college = Globals.colleges[k];
                    console.log('about to create soiree of type ' + soireeType + ' for college ' + college);

                    Soiree.createSoireeWithType(soireeType, college, function(soiree){
                        console.log("created soiree of type: " + soiree.soireeType + " in soireeCreator");
                    }, function(err){
                        console.log("error creating soiree in soireeCreator: " + err);
                    }, {});
                }
            }
        }
    }
};

module.exports = func;