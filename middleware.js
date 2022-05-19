function authenticationCheck(req, res, next){
    //Check the users token is valid
    //TODO add correct auth check
    if(req.header.token){
        log(req.header)
        res.send('User failed the authentication check')
    }
    next();
}


module.exports = {
    authenticationCheck
}