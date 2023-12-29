const mongoose =require('mongoose');


const chatModel=new mongoose.Schema(
    {
       chatName:{
          type:String,
          trim:true
       },
       isGroupChat:{
          type:Boolean,
          default:false,
       },
       users:[{
          // This will contain the id to that particular user 
          type:mongoose.Schema.Types.ObjectId,  
          ref:"User",
       }],
       latestMessage:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Message",
       },
       groupAdmin:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"User",
       }
    },
    {
        timestamps:true,
    }
);


const Chat=mongoose.model("Chat",chatModel);

module.exports=Chat;
