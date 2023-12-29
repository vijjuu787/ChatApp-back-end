const express = require('express');
const dotenv= require("dotenv");
const cors=require('cors');
// const { chats } = require('./data/data');
const connectDB = require('./config/conn');
dotenv.config();
const app=express();
app.use(cors());
const userRoutes =require('./routes/userRoutes.js');
const chatRoutes=require('./routes/chatRoutes.js');
const messageRoutes=require('./routes/messageRoutes.js');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path=require('path');

connectDB();

app.use(express.json());

app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);

//-----------------Deployment-----------------------------

// const __dirname1=path.resolve();

// if(process.env.NODE_ENV==="production"){

//    app.use(express.static(path.join(__dirname1,"/frontend/build")));

//    app.get('*',(req,res)=>{
//         res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
//    })

// }else{
//    app.get("/",(req,res)=>{
//       res.send("API is running successfully");
//    });
// }

//-----------------Deployment-----------------------------


//error handling apis
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

const server=app.listen(PORT,()=>{
    console.log(`Server is running at port no. ${PORT}`);
})

const io=require("socket.io")(server,{
    pingTimeout:60000,   //If user does not send message for 60 seconds it will close the connection to save bandwidth
    cors:{
        origin:"*",
    }
});

io.on("connection",(socket)=>{
   console.log('connected to socket.io');  
   
   socket.on("setup",(userData)=>{
      socket.join(userData._id);
      socket.emit("connected");
   })

   //Whenver we are going to click a chat -> we are going to create a room with that user and whenever a new user comes it is added to room
   socket.on("join chat",(room)=>{
      socket.join(room);
      // console.log('user joined room: '+room);
   });

   socket.on("typing",(room)=>{
      socket.in(room).emit("typing");
   });

   socket.on("stop typing",(room)=>{
      socket.in(room).emit("stop typing");
   });

   //send message functionality
   socket.on("new message",(msgReceived)=>{
      var chat=msgReceived.chat;
      if(!chat.users){
        return console.log("chat.users is not defined");
      }

      chat.users.forEach((user)=>{
         if(user._id===msgReceived.sender._id)return;

         //in -> inside users room
         socket.in(user._id).emit("message recieved",msgReceived);
      })
   })

   //notify on group chat
   socket.on("groupChat created",(selectedUsers)=>{
      //  console.log(data.users); undefined
      // console.log(selectedUsers);
      for(let i=0;i<selectedUsers.length;i++){
         // console.log(selectedUsers[i].name);
         socket.in(selectedUsers[i]._id).emit("groupChat created")
      }
   })

   //notif on removal from group chat
   socket.on("you are removed",(chatSelected)=>{
      //  console.log(chatSelected);
       for(let i=0;i<chatSelected.users.length;i++){
          socket.in(chatSelected.users[i]._id).emit("you are removed");
       }
   })

   socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
})
