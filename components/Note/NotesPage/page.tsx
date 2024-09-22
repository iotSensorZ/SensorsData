'use client';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import NoteCard from '../NoteCard/page';
import { Button } from '@/components/ui/button';
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { useActivityTracker } from '@/context/ActivityTracker';

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

interface Note {
  id: string;
  _id: string;
  title: string;
  content: string;
  labels: string[];
  userId: string;
}

const premadeLabels = ['Work', 'Personal', 'Urgent', 'Miscellaneous'];

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [createDialogIsOpen, setCreateDialogIsOpen] = useState(false);
  const { user } = useUser();
  // const { trackPageView, trackButtonClick } = useActivityTracker();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return; // Only fetch notes if user is defined
  
      try {
        const response = await fetch(`/api/notes?userId=${user.id}`);
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
  
    fetchNotes(); // Fetch notes when the component mounts or user changes
  }, [user]); // Only depends on user

  
  const handleAddNote = async () => {
    if (!title.trim() || !content.trim() || !user) {
      console.error('Validation error: Title and content must not be empty, or user is missing');
      return;
    }

    const newNote = {
      title,
      content,
      labels: selectedLabels,
      userId: user.id,
      id: '',
      _id: ''
    };

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to add note:', errorData.message);
        return;
      }

      const data = await response.json();
      setNotes(prevNotes => [...prevNotes, { ...newNote, id: data.id, _id: data._id }]);
      setTitle('');
      setContent('');
      setSelectedLabels([]);
      setCreateDialogIsOpen(false);
      // trackButtonClick('Add Note');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!user || !selectedNote) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedNote._id,
          title: selectedNote.title,
          content: selectedNote.content,
          labels: selectedNote.labels || [],
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update the note:", error);
        return;
      }

      const updatedNote = await response.json();
      setNotes(prevNotes => prevNotes.map(note => note._id === updatedNote._id ? updatedNote : note));
      closeDialog();
      // trackButtonClick('Update Note');
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!noteId || !user) return;

    try {
      const response = await fetch(`/api/notes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: noteId, userId: user.id }),
      });

      if (!response.ok) {
        console.error("Failed to delete the note");
        return;
      }

      const result = await response.json();
      setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
      closeDialog();
      // trackButtonClick('Delete Note');
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const toggleLabelSelection = (label: string) => {
    setSelectedLabels(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const openDialog = (note: Note) => {
    setSelectedNote(note);
    setDialogIsOpen(true);
    // trackButtonClick('Open Edit Note Dialog');
  };

  const closeDialog = () => {
    setSelectedNote(null);
    setDialogIsOpen(false);
  };


  return (
    <div>
      <motion.div variants={fadeInAnimationsVariants}
        initial="initial" whileInView="animate"
        viewport={{ once: true }}
        custom={2} className="relative overflow-hidden flex px-8 py-4 md:p-8 text-slate-100 bg-black">
        <div className="flex flex-col mx-auto w-full">
          <h3 className="scroll-m-20 text-5xl font-medium">Organise Your</h3>
          <h3 className="border-t scroll-m-20 text-lg font-semibold tracking-tight lg:text-3xl">Notes</h3>
        </div>
      </motion.div>

      <div className='p-4 bg-white'>
        <motion.div variants={fadeInAnimationsVariants}
          initial="initial" whileInView="animate"
          viewport={{ once: true }}
          custom={10} className='bg-slate-100 p-4 rounded-lg'>

          <div className="mb-4 p-4 align-middle justify-center text-center">
            <Button variant='outline' className='rounded-lg w-2/3 border-[#4F46E5] border-2 text-slate-500 font-light hover:text-slate-400 hover:bg-white' onClick={() => setCreateDialogIsOpen(true)}>Take a note...</Button>
          </div>

          <div className="flex flex-wrap justify-center font-light">
            {notes.map(note => (
              <NoteCard key={note._id} note={note} onClick={() => openDialog(note)} />
            ))}
          </div>

          <Dialog open={createDialogIsOpen} onOpenChange={setCreateDialogIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Note</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
                <textarea
                  placeholder="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
                <div className="flex flex-wrap mb-2">
                  {premadeLabels.map((label, index) => (
                    <button
                      key={index}
                      onClick={() => toggleLabelSelection(label)}
                      className={`p-2 m-1 rounded ${selectedLabels.includes(label) ? 'bg-[#4F46E5] text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  // trackButtonClick('Add Note'); // Track button click
                  handleAddNote(); // Call your existing add note function
                }}>Add Note</Button>
                <Button variant="outline" onClick={() => setCreateDialogIsOpen(false)}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
              </DialogHeader>
              {selectedNote && (
                <div className="grid gap-4 py-4">
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                  />
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                  />
                  <div className="flex flex-wrap mb-2">
                    {premadeLabels.map((label, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setSelectedNote({
                            ...selectedNote,
                            labels: selectedNote.labels.includes(label)
                              ? selectedNote.labels.filter(l => l !== label)
                              : [...selectedNote.labels, label]
                          })
                        }
                        className={`p-2 m-1 rounded ${selectedNote.labels.includes(label) ? 'bg-[#4F46E5] text-white' : 'bg-gray-200 text-gray-800'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleUpdateNote}>Update Note</Button>
                {selectedNote && (
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteNote(selectedNote._id)}
                    className="ml-2"
                  >
                    Delete Note
                  </Button>
                )}
                <Button variant="blue" onClick={closeDialog} className="ml-2 rounded-md">Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default NotesPage;
