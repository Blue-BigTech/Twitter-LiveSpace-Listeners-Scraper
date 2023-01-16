var fs = require("fs");
const _ = require("lodash");

function checkValid(ArrayOfLisetenrs, pos) {
     var checkValidListener = fs.readFileSync('ryan-carson-followers.json');
     checkValidListener = checkValidListener.toString();
     var lisetenrs = JSON.parse(checkValidListener);

     lisetenrs = _.shuffle(lisetenrs);

     for (let index = 0; index < ArrayOfLisetenrs.length; index++) {

          var lisetenInSpace = ArrayOfLisetenrs[index].profile_url;

          var findDuplocate = lisetenrs.find(data => data.profile_url == lisetenInSpace);
          if (findDuplocate) {
               delete lisetenrs[index];
          }
     }

     var getUnique = lisetenrs.slice(0, pos);

     var UniqueListeners = [...ArrayOfLisetenrs, ...getUnique]; //

     return UniqueListeners;
}

function calcPos(total, current) {
     var step = 1000;
     var section = parseInt(total / step);
     return total - current - parseInt(total / section);
}
module.exports = { checkValid, calcPos };