import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

interface Task {
  _id: string;
  id: string;
  title: string;
  done: boolean;
}

interface TaskListProps {
  id: string;
  title: string;
  done: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskList: React.FC<TaskListProps> = ({ id, title, done, setTasks }) => {
  const { user } = useUser();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isDone, setIsDone] = useState(done);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle task update
  const handleUpdate = async () => {
    if (!user) return;
    console.log("newtitle",newTitle)
    try {
      const response = await fetch(`/api/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title: newTitle, done: isDone,userId: user.id }), // Pass the updated title and done status
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks((tasks) =>
        tasks.map((task) => (task._id === id ? { ...task, title: newTitle, done: isDone } : task))
      );
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task: ', error);
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (!user?.id) {
        toast.error('Missing task or user information');
        return;
      }
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, userId:user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks((tasks) => tasks.filter((task) => task._id !== id));
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task: ', error);
    }
  };

  // Handle checkbox toggle
  const handleToggleDone = async () => {
    setIsDone(prevDone => !prevDone); // Update local state
    if(!user)return;
    try {
      const response = await fetch(`/api/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title: newTitle, done: !isDone,userId: user.id }), // Toggle done status
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      // Update task list with the new status
      setTasks(tasks =>
        tasks.map(task =>
          task._id === id ? { ...task, done: !isDone } : task
        )
      );
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task: ', error);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 border border-gray-200 rounded mb-2 bg-white">
      {isEditing ? (
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleUpdate}
          onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
          className="w-full p-2 border border-gray-300 rounded"
        />
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isDone}
              onChange={handleToggleDone}
              className="mr-2"
            />
            <span>{title}</span>
          </div>
          <div className="flex">
            <Button onClick={() => setIsEditing(true)} className="ml-2">Edit</Button>
            <Button onClick={handleDelete} className="ml-2" variant="outline">Delete</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
