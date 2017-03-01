#! node

/* Passwords module for shoplist server, uses bcrypt
https://en.wikipedia.org/wiki/Bcrypt
https://github.com/kelektiv/node.bcrypt.js

it is a better alternative to PBKDF2
https://medium.com/@mpreziuso/password-hashing-pbkdf2-scrypt-bcrypt-1ef4bb9c19b3#.hey2xiufi

*/

var bcrypt = require('bcrypt');

// cb is function(err, passwordHash)
var secureHash = function(password, cb) {
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if (err) return cb(err);
      bcrypt.hash(password, salt, cb );
    });
  };
   
// cb is function(err)
var checkHash = function (password, hash, cb) {
    bcrypt.compare(password, hash, (err,res)=>cb(!res));
  }


/* main */
if (module.parent) {
  exports.hash = secureHash;
  exports.check = checkHash;
} else {
  (function main(){
    var test = process.argv[2] || "test";
    
    secureHash(test, function(err,hash) {
      console.log('password',test,'->',hash); 
      checkHash(test, hash, function (err) {
         console.log('password "'+test+'" is '+(err?'invalid':'correct'));
      }); 
      checkHash('attempt', hash, function (err) {
         console.log('password "'+'attempt'+'" is '+(err?'invalid':'correct'));
      }); 
    });
  })();
}
