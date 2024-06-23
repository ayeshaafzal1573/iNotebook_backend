const express = require('express');
const User = require('../models/User');
var fetchuser = require('../middleware/fetchuser');
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
//json web token client or server k bech m security provide krta ha
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Aishaisprogrammer';
//ROUTE-1 CREATE A USER END POINT USING: POST "/api/auth/". no login require 
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    // if there are errors return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() });
    }
    //Check whether user with same  exist already
    try {


        let user = await User.findOne({ email: req.body.email });
        // console.log(use~r);
        if (user) {
            return res.status(400).json({ error: "Sorry user with this email already exist" });

        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)
        //CREATE A NEW USER
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data = {
            user: {
                id: user.id
            }
        }
        //jwt token
        const authtoken = jwt.sign(data, JWT_SECRET);
        // console.log(jwtData);
        res.json({ authtoken });
    }
    //IF THERE IS ANY ERROR
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurs");
    }

    //     .then(user => res.json(user)).catch(err => {
    //     console.log(err)
    //     res.json({ error: 'Please enter a unique value for email', message: err.message })
    // })
});
//ROUTE-2 Authenticate a user using:POST "api/auth/login"
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password cannot be blank').exists(),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });

        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


});
// ROUTE-3: Get logged-in user details using: POST "api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;
