'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import FolderList from '@/components/StorageComponent/FolderList/page';
import FileList from '@/components/StorageComponent/FileList/page';
import FileUpload from '@/components/StorageComponent/FileUpload/page';

const StoragePage = () => {
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  const fadeInAnimationsVariants = {
    initial: {
      opacity: 0,
      y: 100,
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * index,
      },
    }),
  };
  console.log("Selected folder:", selectedFolder);
  return (
    <div className="">
      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={10}
        className="relative overflow-hidden flex px-10 py-10 md:p-10 bg-slate-200 text-black"
      >
        <div className="flex flex-col mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-bold tracking-tight first:mt-0">
              File Manager
            </h3>
          </div>
          <div>
            <p className="leading-7 text-slate-600 font-semibold">Your personal storage space</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-16 bg-slate-200 p-4 m-4 rounded-xl">
        <FolderList onFolderSelect={setSelectedFolder} />
        {selectedFolder && (
          <>
            <FileList folder={selectedFolder} />
            <FileUpload folder={selectedFolder} onUploadComplete={() => setSelectedFolder(selectedFolder)} />
          </>
        )}
      </div>
    </div>
  );
};

export default StoragePage;
