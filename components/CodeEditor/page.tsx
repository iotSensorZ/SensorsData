'use client';
import React, { useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, Transition } from '@headlessui/react';
import { Toaster, toast } from 'sonner';
import MonacoEditor from '@monaco-editor/react';
import Sk from 'skulpt';
import axios from 'axios';
import { useUser } from '@/context/UserContext';

const CodeEditor = () => {
  const [editorState, setEditorState] = useState('# Write your Python code here...');
  const [output, setOutput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const { user } = useUser();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleEditorChange = (value:any) => {
    setEditorState(value || '');
  };

  const runCode = () => {
    setOutput(''); 
    Sk.configure({ output: (text:String) => setOutput((prev) => prev + text) });

    try {
      Sk.importMainWithBody('<stdin>', false, editorState);
    } catch (err:any) {
      setOutput(`Error running code: ${err.message}`);
      toast.error(`Error running code: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('User not logged in');
      return;
    }
  
    try {
      const formattedContent = editorState; 
  
      const response = await axios.post('/api/documents/', {
        title,
        content: formattedContent, 
        userId: user.id,
        isPublic: false, 
      });
  
      if (response.status === 201) {
        toast.success('Document saved successfully');
        const reportUrl = response.data.url; 
        console.log('Report URL:', reportUrl);
      } else {
        toast.error('Failed to save document');
      }
    } catch (err) {
      toast.error('Failed to submit report');
      console.error('Error submitting report:', err);
    } finally {
      closeModal();
    }
  };
  

  return (
    <>
      <div className="mx-4 toolbar flex justify-between mt-4">
        <Button variant="blue" type="button" onClick={openModal} className="text-white">
          Save Output
        </Button>
        <Button variant="blue" type="button" onClick={runCode} className="text-white">
          Run Code
        </Button>
      </div>
      <div className="editor-container flex h-screen mt-4">
        <Toaster />
        <div className="flex-1">
          <MonacoEditor
            height="100%"
            defaultLanguage="python"
            value={editorState}
            onChange={handleEditorChange}
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="output-container w-1/3 p-4 border-l bg-slate-800 text-white border-gray-300">
          <h3 className="text-lg font-bold">Output:</h3>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>

        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Enter Report Title
                  </Dialog.Title>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="modal-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Title"
                    />
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="blue"
                      onClick={handleSubmit}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      className="inline-flex justify-center px-4 py-2 ml-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
};

export default CodeEditor;
