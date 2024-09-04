import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';

// Configure Multer for file storage
const upload = multer({ dest: 'uploads/' });

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export const fileUploadMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return runMiddleware(req, res, upload.single('file'));
};
