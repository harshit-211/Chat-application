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

const conversationSchemas = new mongoose.Schema({
    participants : [{ type : mongoose.Schema.Types.ObjectId, ref : "User", required : true }],
    isGroup : { type : Boolean, required : true },
    groupName : { type : String },
    lastMessage : { type : mongoose.Schema.Types.ObjectId, ref : "Message" }
}, { timestamps : true });

const messageSchema = new mongoose.Schema({
    conversationId : { type : mongoose.Schema.Types.ObjectId, ref : "Conversation", required : true },
    sender : { type : mongoose.Schema.Types.ObjectId, ref : "User", required : true },
    messageType : {
        type : String,
        enum : ["text","image","video","file","audio"],
        default : "text"
    },
    content : { type : String, required : true },
    fileMeta : {
        originalName : { type : String },
        size : { type : Number },
        mimeType : { type : String }
    },
    status : {
        type : String,
        enum : ["sent","delivered","seen"],
        default : "sent"
    },
    deletedFor : [{ type : mongoose.Schema.Types.ObjectId, ref : "User" }]
}, { timestamps : true });

const User = mongoose.model("User",userSchemas);
const Conversation = mongoose.model("Conversation",conversationSchemas);
const Message = mongoose.model("Message",messageSchema);

export default { User, Conversation, Message };