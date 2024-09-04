import mongoose from 'mongoose'

const documentSchema  =new mongoose.Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
})

export const Document = mongoose.models?.Document || mongoose.model('Document', documentSchema);