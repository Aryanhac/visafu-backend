const mongoose=require('mongoose');
const jwt = require('jsonwebtoken');
const UserSchema=new mongoose.Schema({
    phoneNumber:{
        type:String,
        unique:true,
        required:true,
    },
    otp:{
        value:{
            type:String
        },
        createdAt:{
            type:Number
        }
    },
    avatar:{
        public_id:{
            type:String,
            required:false
        },
        url:{
            type:String,
            required:false
        }
    },
    role:{
        type:String,
        default:'user'
    },
    createdAt:{
        type:String,
        require:true
    },
    gender:{
        type:String, 
        require:false
    }
    
});

// for generating token
UserSchema.methods.getJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_ID,{
        expiresIn:process.env.JWT_EXPIRE,
    })
};

module.exports=mongoose.model("User",UserSchema);