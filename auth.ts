import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDB from "./lib/db";
import { User } from "./models/User";
import { compare } from "bcryptjs";
import github from "next-auth/providers/github";
import google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [

    github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),

    google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),

    Credentials({
      name:'Credentials',
      credentials:{
        email:{label:"Email",type:"email"},
        password:{label:"Password",type:"password"},
      },


      authorize: async(credentials)=>{
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined

        if(!email || !password){
          throw new CredentialsSignin('please provide both email & password');
        }

          await connectDB()

          const user = await User.findOne({email}).select("+password +role")

          if(!user) {
            throw new Error('invalid email or password')
          }
          if(!user.password) {
            throw new Error('invalid email or password')
          }


          const isMatched = await compare(password,user.password)

          if(!isMatched){
            throw new Error("password did not matched");
          }

          const userData = {
            id: user._id,
            email: user.email,
            role: user.role,
            profilePicUrl:user.profilePicUrl,
            name: `${user.firstName} ${user.lastName}`,
          }
          return userData;
      },


    }),
  ],

  pages:{
    signIn: '/login'
  },

  callbacks: {
    async session({session,token}){
      // if(token?.sub && token?.role){
        session.user.id=token.id;
        session.user.role=token.role;
        session.user.name = token.name as string; 
        session.user.email = token.email as string;
        session.user.profilePicUrl=token.profilePicUrl as string
      // }
      return session;
    },
async jwt({token,user}){
  // console.log("token",token);
  if(user){
    token.id = user.id as string;
    token.role = user.role;
    token.name = user.name; 
    token.email = user.email;
    token.profilePicUrl=user.profilePicUrl;
  }
  return token;
},

    signIn: async ({ user, account }) => {
      if (account?.provider === "google") {
        try {
          const { email, name, image, id } = user;
          await connectDB();
          const alreadyUser = await User.findOne({ email });

          if (!alreadyUser) {
            await User.create({ email, name, image, authProviderId: id });
          } else {
            return true;
          }
        } catch (error) {
          throw new Error("Error while creating user");
        }
      }

      if (account?.provider === "credentials") {
        return true;
      } else {
        return false;
      }
    },
  },
})