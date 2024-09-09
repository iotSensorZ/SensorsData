'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from "framer-motion";
import { FaPencilAlt } from "@react-icons/all-files/fa/FaPencilAlt"
import { FaTrashAlt } from "@react-icons/all-files/fa/FaTrashAlt"

interface Resource {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  rating: number;
  description: string;
  image: string;
}

const AdminDashboard = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resourceData, setResourceData] = useState<Resource>({
    name: '',
    type: '',
    address: '',
    latitude: 0,
    longitude: 0,
    openingHours: '',
    rating: 0,
    description: '',
    image: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('/api/resources');
      if (Array.isArray(response.data)) {
        setResources(response.data);
        console.log('resdata',response.data)
      } else {
        console.error('Invalid data format for resources:', response.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResourceData((prevData) => ({
      ...prevData,
      [name]: name === 'latitude' || name === 'longitude' || name === 'rating' 
        ? value === '' ? '' : !isNaN(parseFloat(value)) ? parseFloat(value) : 0
        : value,
    }));
  };

  const handleSave = async () => {
    let imageUrl = resourceData.image;

    if (imageFile) {
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!uploadPreset) {
        console.error('Cloudinary upload preset is not defined.');
        return;
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', uploadPreset);

      try {
        const uploadResponse = await axios.post('https://api.cloudinary.com/v1_1/dbnk8oc7k/image/upload', formData);
        imageUrl = uploadResponse.data.secure_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      }
    }

    const updatedResourceData = { ...resourceData, image: imageUrl };
console.log('updated',selectedResource)
    try {
      if (selectedResource) {
        await axios.put(`/api/resources?id=${selectedResource._id}`, updatedResourceData);
      } else {
        await axios.post('/api/resources', updatedResourceData);
      }

      setIsDialogOpen(false);
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      console.error('Error deleting resource: ID is undefined');
      return;
    }
    
    try {
      await axios.delete(`/api/resources?id=${id}`);
      fetchResources(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const fadeInAnimationsVariants = {
    initial: {
      opacity: 0,
      y: 100
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * index
      }
    })
  };

  return (
    <div>
      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial" whileInView="animate"
        viewport={{ once: true }}
        custom={2} className="relative overflow-hidden flex  px-10 py-10 md:p-10 text-white bg-slate-800">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b border-slate-600 pb-2 text-3xl font-bold tracking-tight first:mt-0">
              Admin Dashboard
            </h3>
          </div>
          <div>
            <p className="leading-7 text-white font-semibold">
              Add your resources
            </p>
          </div>
        </div>
      </motion.div>

      <div className='flex relative justify-end right-4'>
        <Button variant='blue' className='my-4 flex justify-end' onClick={() => {
          setSelectedResource(null);
          setResourceData({
            name: '',
            type: '',
            address: '',
            latitude: 0,
            longitude: 0,
            openingHours: '',
            rating: 0,
            description: '',
            image: ''
          });
          setIsDialogOpen(true);
        }}>Add Resource</Button>
      </div>

      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial" whileInView="animate"
        viewport={{ once: true }}
        custom={10}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Edit</TableHead>
              <TableHead className="w-[100px]">Reference</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map(resource => (
              <TableRow key={resource._id} className='border-b bg-white border-gray-300 hover:bg-gray-100'>
                <TableCell onClick={() => {
                  setSelectedResource(resource);
                  setResourceData(resource);
                  setIsDialogOpen(true);
                }}
                  className='cursor-pointer'><FaPencilAlt /></TableCell>
                <TableCell className="font-medium">{resource._id}</TableCell>
                <TableCell>{resource.name}</TableCell>
                <TableCell>{resource.type}</TableCell>
                <TableCell>{resource.address}</TableCell>
                <TableCell>{resource.rating}</TableCell>
                <TableCell className="text-right justify-center flex cursor-pointer">
                  <FaTrashAlt onClick={() => handleDelete(resource._id!)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedResource?.id ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="name" className="text-right">Name:</Label>
                <Input type="text" name="name" placeholder="Name" value={resourceData.name} onChange={handleInputChange} />
              </div>
              <div className="flex-1">
                <Label htmlFor="type" className="text-right">Type:</Label>
                <Input type="text" name="type" placeholder="Type" value={resourceData.type} onChange={handleInputChange} />
              </div>
            </div>
            <Label htmlFor="address" className="text-right">Address:</Label>
            <Input type="text" name="address" placeholder="Address" value={resourceData.address} onChange={handleInputChange} />
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="latitude" className="text-right">Latitude:</Label>
                <Input type="number" name="latitude" placeholder="Latitude" value={resourceData.latitude} onChange={handleInputChange} />
              </div>
              <div className="flex-1">
                <Label htmlFor="longitude" className="text-right">Longitude:</Label>
                <Input type="number" name="longitude" placeholder="Longitude" value={resourceData.longitude} onChange={handleInputChange} />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="openingHours" className="text-right">Opening Hours:</Label>
                <Input type="text" name="openingHours" placeholder="Opening Hours" value={resourceData.openingHours} onChange={handleInputChange} />
              </div>
              <div className="flex-1">
                <Label htmlFor="rating" className="text-right">Rating:</Label>
                <Input type="number" name="rating" placeholder="Rating" value={resourceData.rating} onChange={handleInputChange} />
              </div>
            </div>
            <Label htmlFor="description" className="text-right">Description:</Label>
            <Input type="text" name="description" placeholder="Description" value={resourceData.description} onChange={handleInputChange} />
            <Label htmlFor="image" className="text-right">Image URL:</Label>
            <Input type="file" name="image" onChange={handleFileChange} />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
