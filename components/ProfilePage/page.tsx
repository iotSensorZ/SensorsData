'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import axios from 'axios';
import Avatar from "@/public/images/avatar.jpg"
import Loading from "@/public/images/spinner.gif"
import Image from 'next/image';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  bio: string;
  location: string;
  about: string;
  address: string;
  contact: string;
  occupation: string;
  profilePicUrl: string;
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    bio: '',
    location: '',
    about: '',
    address: '',
    contact: '',
    occupation: '',
    profilePicUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        try {
          const response = await axios.get(`/api/user/${session.user.id}`);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile({ ...userProfile, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    let profilePicUrl = userProfile.profilePicUrl;
  
    if (profilePic) {
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      console.log('Cloudinary Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      if (!uploadPreset) {
        console.error('Cloudinary upload preset is not defined.');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', profilePic);
      formData.append('upload_preset', uploadPreset);
  
      try {
        const uploadResponse = await axios.post('https://api.cloudinary.com/v1_1/dbnk8oc7k/image/upload', formData);
        profilePicUrl = uploadResponse.data.secure_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      }
    }
  
    const updatedProfile = { ...userProfile, profilePicUrl };
  
    try {
      await axios.put(`/api/user/${session?.user.id}`, updatedProfile);
      setUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };
  

  if (!session) {
 return(
<div className="flex justify-center items-center mt-4">
<Image src={Loading} alt='' width={200} height={200}
/>
  </div>
 )
  }

  return (
    <div className="">

<div className="flex flex-col  mx-auto w-full">
          <div className='flex'>
          <div className="m-2">
                  {userProfile.profilePicUrl ? (
                    <img src={userProfile.profilePicUrl} alt="Profile" 
                    className="w-32 h-32 object-cover rounded-full"
                    style={{position:"relative",top:"-50px", left:"30px"}} />
                  ) : (
                    <img src={userProfile.profilePicUrl} alt="Profile" className="w-32 h-32 object-cover rounded-full" />
                  )}
                </div>
            <div className="justify-center text-center align-middle" style={{alignContent:"center"}}>
            <p className='text-2xl text-black font-semibold'>
            {userProfile.firstName} {userProfile.lastName}
            </p>
          <p className="mx-10 text-slate-800 font-light">
            {userProfile.email}
          </p>
          </div>
            </div>
          </div>
          <div>
        </div>

        <div className="p-14 bg-white">
      <div className="bg-white p-4 rounded-lg align-middle justify-center flex">
          <div className="bg-slate-100 my-4 p-4 rounded-xl w-2/3">
          <h3 className="text-3xl font-medium my-4 border-b-2">My Profile</h3>
          {isEditing ? (
      <div className='p-6'>
      <div className="mb-4">
        <Label htmlFor="birthday">Birthday</Label>
        <Input
          id="birthday"
          name="birthday"
          type="date"
          value={userProfile.birthday}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          value={userProfile.bio}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          type="text"
          value={userProfile.location}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="about">About</Label>
        <textarea
          id="about"
          name="about"
          value={userProfile.about}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          type="text"
          value={userProfile.address}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          name="contact"
          type="text"
          value={userProfile.contact}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="occupation">Occupation</Label>
        <Input
          id="occupation"
          name="occupation"
          type="text"
          value={userProfile.occupation}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="profilePic">Profile Picture</Label>
        <Input
          id="profilePic"
          name="profilePic"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="text-center">
      <Button onClick={handleSave} className="mr-2">Save</Button>
      <Button onClick={() => setIsEditing(false)}>Cancel</Button>
      </div>
    </div>
  ) : (
            <div className='p-8 flex flex-col'>
            <div className="mb-4">
              <Label>Birthday</Label>
              <p className='font-light'>{userProfile.birthday}</p>
            </div>
            <div className="mb-4">
              <Label>Bio</Label>
              <p className='font-light'>{userProfile.bio}</p>
            </div>
            <div className="mb-4">
              <Label>Location</Label>
              <p className='font-light'>{userProfile.location}</p>
            </div>
            <div className="mb-4">
              <Label>About</Label>
              <p className='font-light'>{userProfile.about}</p>
            </div>
            <div className="mb-4">
              <Label>Address</Label>
              <p className='font-light'>{userProfile.address}</p>
            </div>
            <div className="mb-4">
              <Label>Contact</Label>
              <p className='font-light'>{userProfile.contact}</p>
            </div>
            <div className="mb-4">
              <Label>Occupation</Label>
              <p>{userProfile.occupation}</p>
            </div>
            <div className="mb-4">
              <Label>Profile Picture</Label>
              {userProfile.profilePicUrl ? (
                <img src={userProfile.profilePicUrl} alt="Profile" className="w-32 h-32 object-cover rounded-full" />
              ) : (
                <p>No profile picture</p>
              )}
            </div>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
