import mongoose from "mongoose";

const userSchemas = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    password : { 
        type : String, 
        required : true 
    },
    username : {
        type : String,
        sparse : true,
        trim : true,
        unique : true
    },
    avatar : {
        type : String,
        default : ""
    },
    isProfileComplete : {
        type : Boolean,
        default : false
    },
    isOnline : {
        type : Boolean,
        default : false,
    },
    lastSeen : {
        type : Date,
        default : Date.now()
    }
});

const User = mongoose.model("User",userSchemas);

export default User;