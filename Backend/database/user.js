import mongoose from "mongoose";

const userSchemas = new mongoose.Schema({
    email : String,
    password : String
});

const User = mongoose.model("User",userSchemas);

export default User;