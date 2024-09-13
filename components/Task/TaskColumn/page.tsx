import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskList from '../TaskList/page';
import { motion } from "framer-motion";

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

interface TaskColumnProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ tasks, setTasks }) => {
  return (
    <motion.div variants={fadeInAnimationsVariants}
      initial="initial" whileInView="animate"
      viewport={{ once: true }}
      custom={10} className='container p-4'>

      <div className='bg-white my-5 rounded-lg p-4'>
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task,label) => (
            <div className='' key={label}>
              <TaskList
                id={task._id}
                key={label}
                title={task.title}
                done={task.done}
                setTasks={setTasks}
              />
            </div>
          ))}
        </SortableContext>
      </div>
    </motion.div>
  );
};

export default TaskColumn;
