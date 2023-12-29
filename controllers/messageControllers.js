const asyncHandler=require('express-async-handler');
const Message=require('../Models/messageModel.js');
const User = require('../Models/userModel');
const Chat = require('../Models/chatModel');

const sendMessage =asyncHandler(async(req,res)=>{
     const {content,chatId}=req.body;
     
     if(!content||!chatId){
        console.log('Required data not present in the message');
        return res.sendStatus(400);
     }

     var newMessage={
        // took the sender from protect middleware
        sender:req.user._id,  
        content:content,
        chat:chatId,
     }

     try{
        var message=await Message.create(newMessage);

        //populating content inside of the message

        message=await message.populate("sender","name pic");

        message=await message.populate("chat");

        message=await User.populate(message,{
            path:'chat.users',
            select:'name pic email',
        });

        //updating message with latest message
        await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:message});

        res.json(message);
     }catch(err){
        res.status(400);
        throw new Error(err.message);
     }
});


const getAllMessages=asyncHandler(async(req,res)=>{
    try{
       const messages=await Message.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat");

       res.json(messages);
    }catch(err){
       res.status(400);
       throw new Error(err.message);
    }
});

module.exports={sendMessage,getAllMessages};
