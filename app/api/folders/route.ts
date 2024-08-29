import { Folder } from "@/models/Folder";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req:NextApiRequest,res:NextApiResponse){
    const {method} = req; 

    switch(method){
        case 'GET':
            try{
                const {userId} = req.query;
                const folders = await Folder.find({userId});
                res.status(200).json(folders);
            }catch(error){
                res.status(500).json({message:"error fetching"});
            }
            break;

        case 'POST':
            try{
                const {userId,folderName} = req.body;
                const folder = new Folder({userId,name:folderName});
                await folder.save();
                res.status(201).json(folder);
            }catch(error){
                res.status(500).json({message:"error creating folder"});
            }
            break;
        default:
            res.setHeader('Allow',['GET','POST']);
            res.status(405).end(`Method ${method} Not allowed`);
             
    }
}