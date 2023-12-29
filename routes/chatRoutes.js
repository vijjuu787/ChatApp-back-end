const express=require('express');
const { protect } = require('../middleware/authMiddleware.js');
const { createChat, getChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatControllers.js');

const router=express.Router();

//creating chat
//->protect middleware : If the user is not logged in , he cannot acces the chat
router.route("/").post(protect,createChat);
router.route("/").get(protect,getChats);  //fetching chats for a particular user
router.route("/group").post(protect,createGroupChat);
router.route("/renameGroup").put(protect,renameGroup);
router.route("/addToGroup").put(protect,addToGroup);
router.route("/removeFromGroup").put(protect,removeFromGroup);

module.exports=router;