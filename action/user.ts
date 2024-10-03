'use server'

import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import {hash,compare} from 'bcryptjs';
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";

const login = async(formData:FormData)=>{
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;


    try{
        await signIn('credentials',{
            redirect: false,
            callbackUrl: "/",
            email,
            password,
        })
    }catch(error){
        const someError = error as CredentialsSignin
        return someError.cause
    }
    redirect('/private/dashboard');

}


const register = async(formData:FormData)=>{
    const firstName = formData.get('firstname') as string;
    const lastName = formData.get('lastname') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
console.log(email);

if(!firstName || !lastName ||!email||!password){
    throw new Error('please fill all fields');
    }

    await connectDB();

    const existingUser = await User.findOne({email})
    if(existingUser)throw new Error("user already exists");

    const hashedPassword = await hash(password,12)
    await User.create({firstName,lastName,email,password:hashedPassword});

    console.log('user created successfully');

    redirect('/login');

}
    const fetchAllUsers=async()=>{
        await connectDB();
        const users = await User.find({});
        return users;
    }



    const changePassword = async (formData: FormData) => {
        const email = formData.get('email') as string;
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
    
        if (!email || !currentPassword || !newPassword) {
            throw new Error('Please fill all fields');
        }
    
        await connectDB();
    
        // Find the user by email and select the password
        const user = await User.findOne({ email }).select("+password");
        if (!user) throw new Error("User not found");
    
        // Verify the current password by comparing the input password with the hashed password
        const isMatched = await compare(currentPassword, user.password);
        if (!isMatched) throw new Error("Current password is incorrect");
    
        // Hash the new password and update it
        const hashedNewPassword = await hash(newPassword, 12);
        user.password = hashedNewPassword; // Update the password
        await user.save(); // Save the updated user
    
        console.log('Password changed successfully');
    
        redirect('/login'); // Redirect after successful password change
    };
    
    

export {register,login,changePassword,fetchAllUsers}