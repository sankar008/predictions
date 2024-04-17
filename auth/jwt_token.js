const { verify, decode, sign } = require("jsonwebtoken");
const User = require("./../v1/User/user.service");
module.exports = {
    checkToken: (req, res, next) =>{
        let token = req.get("authorization");     
        if(token){
            token = token.slice(7);   
            verify(token, "predibets", (err, auth) => {
                var refreshedToken = sign({
                    success: true,
                    auth
                    }, 'predibets', {
                        expiresIn: '12d'
                    });
                    req.token_code = refreshedToken;
                if(err){
                    res.status(400).json({
                        success: false,
                        message: 'invalid token'
                    });
                }else{ 
                    next();
                }
            });
        }else{
            res.json({
                success: false,
                message: "Access denied!"
            })
        }
    },

    auth: async (token, res) => {
        let tokencode = decode(token).auth;
        let isValid = await User.find({emailId: tokencode.result.emailId}).count();
        if(isValid > 0){
             return tokencode;
        }else{
            res.status(400).json({
                success: false,
                message: 'invalid token'
            });
        }
    }
}