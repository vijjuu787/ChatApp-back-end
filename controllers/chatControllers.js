const asyncHandler=require('express-async-handler');
const Chat = require('../Models/chatModel.js');
const { model } = require('mongoose');
const User = require('../Models/userModel.js');

//createChat if it does not exist else send the existing one
const createChat=asyncHandler(async(req,res)=>{
    const {UserId}=req.body;

    if(!UserId){
        console.log("UserId not sent with the request");
        return res.sendStatus(400);
    }

    var ChatExist=await Chat.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:UserId}}},
        ],
    }).populate("users","-password")
    .populate("latestMessage");

    ChatExist=await User.populate(ChatExist,{
        path:'latestMessage.sender',
        select:"name pic email",
    });

    if(ChatExist.length>0){
        res.send(ChatExist[0]);
    }else{
        var newChat={
            chatName:"sender",
            isGroupChat:false,
            users:[req.user._id,UserId],
        };


        try{
           const chatCreated=await Chat.create(newChat);

           const ChatToSendToUser=await Chat.findOne({_id:chatCreated._id}).populate("users","-password");
           
           res.status(200).send(ChatToSendToUser);
        }catch(err){
           res.status(400);
           throw new Error(err.message);
        }
    }
});

const getChats=asyncHandler(async(req,res)=>{
    try{
         Chat.find({users:{$elemMatch:{$eq:req.user._id}}}).populate("users","-password").populate("groupAdmin","-password").populate("latestMessage").sort({updatedAt:-1}).then(async(results)=>{
            results=await User.populate(results,{
                path:"latestMessage.sender",
                select:"name pic email",
            });

            res.status(200).send(results);
         });
      }catch(err){
         res.status(400);
         throw new Error(err.message);
      }
});

const createGroupChat=asyncHandler(async(req,res)=>{
     if(!req.body.users||!req.body.name){
        res.status(400).send({message:"Plz fill all neccessary fiedls"});
     }

     var users=JSON.parse(req.body.users);

     if(users.length<2){
        return res.status(400).send("Less than 2 users");
     };

     //pushing the logggedIn user
     users.push(req.user);

     try{
         const newGroupChat=await Chat.create({
             chatName:req.body.name,
             isGroupChat:true,
             users:users,
             groupAdmin:req.user,
         });
 
         const groupChatTosend=await Chat.find({_id:newGroupChat._id}).populate("users","-password").populate("groupAdmin","-password");
 
         res.status(200).json(groupChatTosend);
     }catch(err){
        res.status(400);
        throw new Error(err.message);
     }
});

const renameGroup=asyncHandler(async(req,res)=>{
      const {chatId,chatName}=req.body;
      const newVersionChat=await Chat.findByIdAndUpdate(chatId,{
            chatName:chatName
      },
      {
         new:true,   
      }).populate("users","-password").populate("groupAdmin","-password");
      
      if(newVersionChat){
        res.json(newVersionChat);
      }else{
        res.status(400);
        throw new Error("Chat name updation failed");
      }
});


const addToGroup=asyncHandler(async(req,res)=>{
     const {chatId,userId}=req.body;

     const chatAfterAddition=await Chat.findByIdAndUpdate(chatId,{
        //push inside users array
        $push:{
            users:userId,
        }
     },{
        new:true,
     }).populate("users","-password").populate("groupAdmin","-password");

     if(chatAfterAddition){
        res.json(chatAfterAddition);
     }else{
        res.status(400);
        throw new Error("new users addition failed");
     }
})

const removeFromGroup=asyncHandler(async(req,res)=>{
     const {chatId,userId}=req.body;
      
     const chatAfterRemoval=await Chat.findByIdAndUpdate(chatId,{
        $pull:{
            users:userId,
        }
     },{
        new:true,
     }).populate("users","-password").populate("groupAdmin","-password");

     if(chatAfterRemoval){
        res.json(chatAfterRemoval);
     }else{
        res.status(400);
        throw new Error("users removal failed");        
     }
})

module.exports={createChat,getChats,createGroupChat,renameGroup,addToGroup,removeFromGroup};