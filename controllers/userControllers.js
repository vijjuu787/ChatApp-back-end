const asyncHandler= require('express-async-handler');
const User=require('../Models/userModel.js');
const generateToken = require('../config/generateToken.js');

const registerUser=asyncHandler(async(req,res)=>{
    const {name,email,password,pic}=req.body;

    if(!name||!email||!password){
        res.status(400);
        throw new Error("Plz enter all required fields");
    }

    const UserAlreadyExist=await User.findOne({
        email:email,
    })

    if(UserAlreadyExist){
        res.status(400);
        throw new Error("User Already exists");
    }


    const newUser=await User.create({
        name:name,
        email:email,
        password:password,
        pic:pic,
    });

    //I also want to send the jwt token to frontend
    if(newUser){
        res.status(201).send({
            _id:newUser._id,
            name:newUser.name,
            email:newUser.email,
            pic:newUser.pic,
            token:generateToken(newUser._id),
        })
    }else{
        res.status(400);
        throw new Error("SignUp failed");
    }
});


const authUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;

    const UserExist=await User.findOne({email:email});

    if(UserExist&&(await UserExist.matchPass(password))){
        // console.log("I am inside authUser")
         res.json({
             _id:UserExist._id,
             name:UserExist.name,
             email:UserExist.email,
             pic:UserExist.pic,
             token:generateToken(UserExist._id),
         })
    }else{
        res.status(400);
        throw new Error("Invalid Credentials");       
    }
});

// api/users?search=srijan
const getAllUsers=asyncHandler(async(req,res)=>{
    const keyW=req.query.search?{
        $or:[
            {name:{$regex:req.query.search,$options:'i'}},
            {email:{$regex:req.query.search,$options:'i'}},
        ]
    }:{
       
    };

    //except the current user return every other user
    const users=await User.find(keyW).find({_id:{$ne:req.user._id}});
    res.send(users);
});

module.exports={registerUser,authUser,getAllUsers};