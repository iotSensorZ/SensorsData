'use client';
import React, { useEffect, useState } from 'react';
import { DndContext, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from '@/components/Task/TaskColumn/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { useUser } from '@/context/UserContext';
import {io } from 'socket.io-client';
const socket = io('http://localhost:3001');
import { useActivityTracker } from '@/context/ActivityTracker';

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

interface Task {
  _id: string;
  id: string;
  title: string;
  done: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const { user } = useUser();
  const { trackPageView, trackButtonClick } = useActivityTracker();
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState<number>(0); // Initialize with a default value


  useEffect(() => {
    console.log("Current user:", user);
    if(!user)return;
    console.log("intasks")
    const activityData = {
      userId: user.id, // Ensure you're passing just the user ID string
      pageUrl: window.location.pathname,
      buttonClicks: {},
      timeSpent,
      cursorPosition,
      lastUpdated,
    };
  
    socket.emit('track-activity', activityData);
  }, [user,timeSpent, cursorPosition, lastUpdated]); 
  


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
  

  useEffect(() => {
    const fetchTasks = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/tasks?userId=${user.id}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            toast.error('Failed to fetch tasks');
            console.error('Error fetching tasks: ', error);
        }
    };
    
    fetchTasks();
  }, [user]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      console.log('No valid drop zone');
      return;
    }

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !user) return;

    const newTask = { title: newTaskTitle, done: false, userId: user.id };
    console.log("New task data:", newTask);
    console.log("ttta:", newTaskTitle);

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
console.log("res",response)
        const data = await response.json();
        console.log("Response data:", data);
        setTasks(data); // Assuming `data` is the updated tasks array
        setNewTaskTitle('');
        setLastUpdated(new Date()); 

        socket.emit('track-activity', {
          userId: user.id,
          pageUrl: '/private/tasks',
          buttonClicks: { 'Add Task': 1 },
          timeSpent: timeSpent, 
          cursorPosition, 
          lastUpdated, 
        });
    } catch (error) {
        toast.error('Failed to add task');
        console.error('Error adding task: ', error);
    }
};


  return (
    <div className=''>
      <motion.div variants={fadeInAnimationsVariants}
        initial="initial" whileInView="animate"
        viewport={{ once: true }}
        custom={2} className="relative overflow-hidden flex px-8 py-4 md:p-8 text-white bg-black">
        <div className="flex flex-col mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 text-lg font-medium">
              Organise Your
            </h3>
          </div>
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight lg:text-5xl">
              Tasks
            </h1>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInAnimationsVariants}
        initial="initial" whileInView="animate"
        viewport={{ once: true }}
        custom={2} className="mx-4 p-4 flex justify-center">
        <Input
          type="text"
          placeholder="New Task"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="w-3/4 p-2 border border-gray-300 rounded mb-2"
        />
        <Button variant='blue' onClick={handleAddTask} className="ml-2">Add Task</Button>
      </motion.div>
      {/* <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}> */}
        <TaskColumn tasks={tasks} setTasks={setTasks} />
      {/* </DndContext> */}
    </div>
  );
};

export default Tasks;
