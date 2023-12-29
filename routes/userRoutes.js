const express = require('express');
const { registerUser, authUser, getAllUsers } = require('../controllers/userControllers.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

//For signup
router.route('/').post(registerUser).get(protect,getAllUsers);

//for login
router.post('/login',authUser);

//get All users
// router.route('/').get(getAllUser);

module.exports=router;