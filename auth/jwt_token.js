const { verify, decode, sign } = require("jsonwebtoken");

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

    auth: (token) => {
        let tokencode = decode(token).auth;
       return tokencode;
    }
}