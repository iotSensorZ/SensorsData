'use client';
import React, { useState, Fragment, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'; // Import pdf-lib
import { htmlToText } from 'html-to-text';
import { Dialog, Transition } from '@headlessui/react';
import { useUser } from '@/context/UserContext';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');
import { useActivityTracker } from '@/context/ActivityTracker';
import { FaFileSignature } from "@react-icons/all-files/fa/FaFileSignature";

// Custom toolbar for Quill
const modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    [{ 'direction': 'rtl' }],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  'font', 'size', 'header', 'align', 'list', 'bullet', 'indent',
  'bold', 'italic', 'underline', 'strike', 'color', 'background',
  'link', 'image', 'video', 'blockquote', 'code-block', 'direction',
];

const QuillEditor = () => {
  const [editorState, setEditorState] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]); // State to manage recent reports
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // State for modal
  const { trackPageView, trackButtonClick } = useActivityTracker();
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState<number>(0); // Initialize with a default value

  // Track user activity
  useEffect(() => {
    if (!user) return;
    
    const activityData = {
      userId: user.id,
      pageUrl: window.location.pathname,
      buttonClicks: {},
      timeSpent,
      cursorPosition,
      lastUpdated,
    };

    socket.emit('track-activity', activityData);
  }, [user, timeSpent, cursorPosition, lastUpdated]);

  // Track mouse movement and time spent
  useEffect(() => {
    const startTime = Date.now();
    
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      const endTime = Date.now();
      const spentTime = endTime - startTime;
      if (!isNaN(spentTime)) {
        setTimeSpent(spentTime);
      } else {
        console.error('Calculated time spent is NaN');
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Open and close modal
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleChange = (value: string) => {
    setEditorState(value);
  };

  // Fetch recent reports
  useEffect(() => {
    if (user) {
      const fetchReports = async () => {
        try {
          const response = await axios.get('/api/generatePDF', { params: { userId: user.id } });
  
          // Filter and sort reports by ownerUserId and createdAt in descending order
          const myReports = response.data.reports.filter((report: { userId: string }) => report.userId === user.id);
          
          const sortedReports = myReports.sort((a: { createdAt: string }, b: { createdAt: string }) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Most recent first
          });
  
          setRecentReports(sortedReports);
        } catch (error) {
          console.error('Error fetching reports:', error);
        }
      };
  
      fetchReports();
    }
  }, [user]);
  
  

  const handleReportClick = (report: any) => {
    setTitle(report.title);
    setEditorState(report.content); // Fill the editor with the selected report content
  };

  const generatePDF = async (title: string, html: string) => {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;
    const MARGIN = 50;
    const FONT_SIZE = 12;
    const LINE_HEIGHT = 15;

    const lines = htmlToText(html, { wordwrap: 130 }).split('\n');
    let y = A4_HEIGHT - MARGIN - 40; // Start from the top of the first page after the title

    const addPage = (includeTitle = false) => {
      const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      if (includeTitle) {
        page.drawText(title, {
          x: MARGIN,
          y: A4_HEIGHT - MARGIN - FONT_SIZE,
          size: 18,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        y = A4_HEIGHT - MARGIN - 60; // Adjust y position for text after title
      } else {
        y = A4_HEIGHT - MARGIN; // Full height for pages without title
      }
      return page;
    };

    let page = addPage(true); // First page includes title

    for (const line of lines) {
      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + word + ' ';
        const textWidth = timesRomanFont.widthOfTextAtSize(testLine, FONT_SIZE);

        if (textWidth > A4_WIDTH - 2 * MARGIN) {
          if (y - LINE_HEIGHT < MARGIN) {
            page = addPage();
          }
          page.drawText(currentLine, {
            x: MARGIN,
            y: y - LINE_HEIGHT,
            size: FONT_SIZE,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });
          currentLine = word + ' ';
          y -= LINE_HEIGHT;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine.trim() !== '') {
        if (y - LINE_HEIGHT < MARGIN) {
          page = addPage();
        }
        page.drawText(currentLine.trim(), {
          x: MARGIN,
          y: y - LINE_HEIGHT,
          size: FONT_SIZE,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        y -= LINE_HEIGHT;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!user) {
      setError('User not logged in');
      toast.error('User not logged in');
      return;
    }

    try {
      const quillEditor = document.querySelector('.ql-editor') as HTMLElement;
      const html = quillEditor.innerHTML;

      const response = await axios.post('/api/documents/', {
        title,
        content: html,
        userId: user.id,
        isPublic,
      });

      if (response.status === 201) {
        toast.success('Document saved successfully');
      } else {
        toast.error('Failed to save document');
      }
    } catch (err) {
      toast.error('Failed to submit report');
      console.error('Error submitting report:', err);
    } finally {
      closeModal();
      socket.emit('track-activity', {
        userId: user.id,
        pageUrl: '/private/writereport',
        buttonClicks: { 'reports': 1 },
      });
      router.push("/private/reports")
    }
  };

  const handleParaphrase = async () => {
    if (!editorState) {
      toast.error('Editor content is empty');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/paraphrase', { text: editorState });
      const paraphrasedText = response.data.result.results.map((item: any) => item.replacement);
      setSuggestions(paraphrasedText);
      toast.success('Text paraphrased successfully');
    } catch (err) {
      toast.error('Failed to paraphrase text');
      console.error('Error paraphrasing text:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setEditorState(suggestion);
    setSuggestions([]);
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Sidebar for Recent Reports */}
        <div className="w-1/5 p-4 border-r border-gray-100 bg-white">
          <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
          <ul>
            {recentReports.map((report) => (
              <li key={report._id} className="mb-2 border-b-2 ">
                <button
                  className="text-slate-500 font-medium hover:underline flex gap-3"
                  onClick={() => handleReportClick(report)}
                >
                 <FaFileSignature/> {report.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Editor Area */}
        

        <div>
        <div className="toolbar flex justify-end mx-4">
  <Button 
    variant="blue" 
    type="button" 
    onClick={openModal} 
    className="m-4 text-white py-2 px-4 rounded-md shadow-sm"
  >
    Save Your Report
  </Button>
  {loading && (
    <div className="flex justify-center items-center mt-4">
      <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
    </div>
  )}
</div>


        <div className="flex-1 p-0 justify-center align-middle text-center h-screen">
          
          <Toaster />
          <div className="flex-1 overflow-hidden flex justify-center h-full m-2">
            <ReactQuill
              value={editorState}
              onChange={handleChange}
              modules={modules}
              formats={formats}
              className='bg-white p-5 rounded-xl'
            />
          </div>

          {/* Suggestions Container */}
          {suggestions.length > 0 && (
            <div className="suggestions-container mt-4 shadow-lg rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Suggestions</h3>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="cursor-pointer p-2 rounded-md bg-green-50 mb-2 text-blue-500 hover:bg-blue-100 transition"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Modal for Saving Report */}
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
      </div>
      </div>
    </>
  );
};

export default QuillEditor;
