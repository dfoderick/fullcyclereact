var bcrypt = require('bcrypt-nodejs');

module.exports = {
    user: {
        username:'', 
        password:'',
        // createpass: function (plainpassword) {
        //     var user = this;
        //         bcrypt.genSalt(10, function (err, salt) {
        //             if (err) {
        //                 return false;
        //             }
        //             bcrypt.hash(plainpassword, salt, null, function (err, hash) {
        //                 if (err) {
        //                     return false;
        //                 }
        //                 user.password = hash;
        //             });
        //         });
        //     }
        // }
    }
}  