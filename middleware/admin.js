const jwt = require('jsonwebtoken')
const { JWT_ADMIN_SECRET } = require('../config')

function adminmiddleware(req,res,next){
    const token = req.headers.token;
    try{
        const decoded = jwt.verify(token, JWT_ADMIN_SECRET)
    }catch(e){
        return res.json({msg: 'Invalid or expired token'})
    }

    if(decoded){
        req.userId = decoded.id;
        next();
    }else{
        res.status(403).json({
            msg: 'You are not signedIn'
        })
    }
}   

module.exports = {
    adminmiddleware
}   