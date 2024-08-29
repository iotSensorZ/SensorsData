import { File } from "@/models/File";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req:NextApiRequest,res:NextApiResponse){
    const {method} = req; 

    switch(method){
        case 'GET':
            try{
                const {userId,folder} = req.query;
                const files = await File.find({userId,folder});
                res.status(200).json(files);
            }catch(error){
                res.status(500).json({message:"error fetching"});
            }
            break;

        case 'POST':
            try{
                const {userId,folder,fileName,url} = req.body;
                const file = new File({userId,folder,name:fileName,url});
                await file.save();
                res.status(201).json(file);
            }catch(error){
                res.status(500).json({message:"error creating file"});
            }
            break;

        case 'DELETE':
            try{
                const {id} = req.query;
                await File.findByIdAndDelete(id);
                res.status(200).json({message:"file deleted successfully"});
            }catch(error){
                res.status(500).json({message:"error deleting"});
            }
            break;
            
        default:
            res.setHeader('Allow',['GET','POST']);
            res.status(405).end(`Method ${method} Not allowed`);
             
    }
}