/**
 * Created by shadygabal on 1/15/16.
 */
var idHelper = (function() {
    return {
        generateId : function(len, addLowercase){
            var letters = "abcdefghjklmnpqrstuvwxyz".toUpperCase().split(""); //No o,i
            if (addLowercase){
                letters.concat(letters.toLowerCase().split(""));
            }
            var numbers = "123456789".split("");//no 0
            var both = letters.concat(numbers);

            var code = "";
            for (var i = 1; i < len+1; i++){//not i=0 because of i%3 call
                var arr;
                if (i % 3 != 0){
                    arr = both;
                }
                else{
                    arr = numbers;
                }
                var randIndex = parseInt(Math.random() * arr.length);
                code += arr[randIndex];
            }
            console.log("generated code: " + code);
            return code;
         }

}

}());

module.exports = idHelper;

