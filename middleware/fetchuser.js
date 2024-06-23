//middleware ek function hota ha user login krwane k lye
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Aishaisprogrammer';
const fetchuser = (req, res, next) => {
    //Get the user from jwttoken and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.send(401).send({ error: "Please authenticate using a valide token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.send(401).send({ error: "Please authenticate using a valide token" })
    }


}
module.exports = fetchuser;