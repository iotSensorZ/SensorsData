// types/next.d.ts
import { NextApiRequest } from 'next';
import { File as MulterFile } from 'multer';

declare module 'next' {
  export interface NextApiRequest {
    file?: MulterFile;  
    files?: MulterFile[]; 
  }
}
