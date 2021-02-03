const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        // how to get the value of the header?
        const token = req.header('Authorization').replace('Bearer', '').trim();
        
        // make sure the token is valid/created by our server
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find associated user
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            // this will trigger catch below
            throw new Error();
        }

        req.token = token;
        
        // give the router handler access to the user (add property to req)
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({
            error: 'Please authenticate.'
        })
    }
}

module.exports = auth;