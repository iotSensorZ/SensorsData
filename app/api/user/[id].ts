import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db';  // Ensure this points to your DB connection logic
import { User } from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await User.findById(id).lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({message:"hello",user});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user data', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user data', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

