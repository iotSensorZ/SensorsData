import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    name: {type:String,required:true},
    url:{type:String,required:true},
    folder:{type:mongoose.Schema.Types.ObjectId,ref:"Folder",required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    createdAt:{type:Date,default:Date.now},
});

export const File = mongoose.models?.File || mongoose.model("File",fileSchema);