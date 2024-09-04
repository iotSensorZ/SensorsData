import mongoose from 'mongoose'

const folderSchema = new mongoose.Schema({
    name: {type:String, required:true},
    userId: {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt: {type:Date,default: Date.now},
    uniqueId: { type: String, unique: true },
})

export const Folder = mongoose.models?.Folder || mongoose.model("Folder",folderSchema);
