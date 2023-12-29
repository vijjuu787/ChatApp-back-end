const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const userModel=mongoose.Schema({
     name:{
        type:String,
        trim:true,
        required:true,
     },
     email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
     },
     password:{
        type:String,
        required:true,
        trim:true,
     },
     pic:{
        type:String,
        required:true,
        default:"https://static.vecteezy.com/system/resources/previews/009/734/564/original/default-avatar-profile-icon-of-social-media-user-vector.jpg",
     }
},{
    timestamps:true,
});


userModel.methods.matchPass=async function(unhassed_password){
    return await bcrypt.compare(unhassed_password,this.password);
}

//Before saving do the following  -> a middlware
userModel.pre(`save`,async function(next){
    if(!this.isModified){
       next();
    }
    
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
});


const User=mongoose.model('User',userModel);

module.exports=User;