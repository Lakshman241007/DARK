import React, { useState } from 'react';
import { Plus, Check, Trash2, Edit2, X, Circle } from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { DarkCore } from '../dark/DarkCore';

export const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, projects } = useDark();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('today');
  const [formProject, setFormProject] = useState('Dark');

  const openNewModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormPriority('medium');
    setFormStatus('today');
    setFormProject('Dark');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormProject(task.project);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        status: formStatus,
        project: formProject,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        status: formStatus,
        dueDate: 'Today',
        project: formProject,
        completed: formStatus === 'completed',
      });
    }

    setIsModalOpen(false);
  };

  const todayTasks = tasks.filter((t) => !t.completed && t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.completed || t.status === 'completed');

  const renderTaskRow = (task: Task) => (
    <div
      key={task.id}
      className="group py-3.5 flex items-center justify-between text-xs font-mono transition-colors hover:text-white"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <button
          onClick={() => toggleTask(task.id)}
          className="text-[#666666] hover:text-white transition-colors cursor-pointer shrink-0"
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed ? (
            <span className="w-4 h-4 flex items-center justify-center border border-white/60 bg-white text-black text-[10px] font-bold rounded-xs">
              ✓
            </span>
          ) : (
            <span className="w-4 h-4 flex items-center justify-center border border-white/20 hover:border-white/60 rounded-xs text-[#555555] text-xs">
              ○
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 truncate">
          <span
            className={`truncate ${
              task.completed ? 'line-through text-[#555555]' : 'text-[#EDEDED]'
            }`}
          >
            {task.title}
          </span>
          <span className="text-[10px] text-[#555555] border border-white/10 px-1.5 py-0.2 rounded-xs shrink-0">
            {task.project}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
        <button
          onClick={() => openEditModal(task)}
          className="p-1 text-[#666666] hover:text-white cursor-pointer"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="p-1 text-[#666666] hover:text-white cursor-pointer"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 select-none space-y-12">
      {/* Header with Small Dark Core */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <DarkCore state="idle" size="sm" showLabel={false} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-widest text-white uppercase">
              TASKS
            </h1>
            <p className="text-[11px] font-mono tracking-wider text-[#666666] uppercase mt-0.5">
              EXECUTION LOG • {todayTasks.length} ACTIVE
            </p>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white bg-white/5 hover:bg-white text-[#EDEDED] hover:text-black text-xs font-mono tracking-wider rounded-xs transition-all cursor-pointer"
        >
          <Plus size={13} />
          <span>NEW TASK</span>
        </button>
      </div>

      {/* TODAY SECTION */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-[0.2em] text-[#666666] uppercase pb-1 border-b border-white/5">
          TODAY
        </div>

        <div className="divide-y divide-white/5">
          {todayTasks.length === 0 ? (
            <div className="py-6 text-xs font-mono text-[#444444]">
              No active tasks remaining today.
            </div>
          ) : (
            todayTasks.map(renderTaskRow)
          )}
        </div>
      </div>

      {/* COMPLETED SECTION */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-[0.2em] text-[#666666] uppercase pb-1 border-b border-white/5">
          COMPLETED
        </div>

        <div className="divide-y divide-white/5">
          {completedTasks.length === 0 ? (
            <div className="py-6 text-xs font-mono text-[#444444]">
              No completed tasks.
            </div>
          ) : (
            completedTasks.map(renderTaskRow)
          )}
        </div>
      </div>

      {/* Minimal Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#070709] border border-white/15 p-6 rounded-xs space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {editingTask ? 'EDIT TASK' : 'CREATE TASK'}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#666666] hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#777777] uppercase text-[10px] mb-1">
                  TITLE
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full bg-[#0D0D10] border border-white/15 p-2.5 text-white rounded-xs focus:border-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#777777] uppercase text-[10px] mb-1">
                  PROJECT
                </label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full bg-[#0D0D10] border border-white/15 p-2 text-white rounded-xs focus:border-white focus:outline-hidden"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-[#777777] hover:text-white cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white text-black font-semibold rounded-xs hover:bg-neutral-200 cursor-pointer"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
