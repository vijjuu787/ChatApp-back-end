const jwt=require('jsonwebtoken');
const User=require('../Models/userModel.js');
const asyncHandler=require('express-async-handler');

const protect=asyncHandler(async(req,res,next)=>{
      let token;

      if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
         try{
            //remove Bearer and take the token
            token=req.headers.authorization.split(" ")[1];
            
            //decode token id
            const decoded_token=jwt.verify(token,process.env.SECRET);
            req.user=await User.findById(decoded_token.id).select("-password");
            next();
         }catch(err){
            res.status(401);
            throw new Error("Not authorized, token failed");
         }
      }

      if(!token){
        res.status(401);
        throw new Error("Not authorized, no token");
      }
});

module.exports={protect};