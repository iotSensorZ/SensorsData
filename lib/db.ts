import mongoose from 'mongoose'

const connectDB = async()=>{
    console.log(`successfully connected to mongodb`)
    try{
        await mongoose.connect(process.env.MONGO_URL!
        )
    }catch(error:any){
        console.log(`error:${error.message}`)
        process.exit(1)
    }
}

export default connectDB;