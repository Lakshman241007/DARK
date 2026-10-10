import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { MemoryCategory, MemoryItem } from '../../types';
import { DarkCore } from '../dark/DarkCore';

export const MemoryPage: React.FC = () => {
  const { memories, addMemory, deleteMemory } = useDark();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<MemoryCategory>('personal');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    addMemory({
      category: formCategory,
      title: formTitle.trim(),
      content: formContent.trim(),
      tags: ['Local', formCategory],
    });

    setFormTitle('');
    setFormContent('');
    setIsModalOpen(false);
  };

  const categories: { id: MemoryCategory; label: string }[] = [
    { id: 'personal', label: 'PERSONAL CONTEXT' },
    { id: 'preferences', label: 'PREFERENCES' },
    { id: 'project', label: 'PROJECT CONTEXT' },
    { id: 'notes', label: 'IMPORTANT NOTES' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 select-none space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <DarkCore state="idle" size="sm" showLabel={false} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-widest text-white uppercase">
              DARK MEMORY
            </h1>
            <p className="text-[11px] font-mono tracking-wider text-[#666666] uppercase mt-0.5">
              PERSISTENT CONTEXT GRAPH • LOCAL
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white bg-white/5 hover:bg-white text-[#EDEDED] hover:text-black text-xs font-mono tracking-wider rounded-xs transition-all cursor-pointer"
        >
          <Plus size={13} />
          <span>INDEX MEMORY</span>
        </button>
      </div>

      {/* Categories Sections with Subtle Dividers (Section 22) */}
      <div className="space-y-10">
        {categories.map((cat) => {
          const items = memories.filter((m) => m.category === cat.id);

          return (
            <div key={cat.id} className="space-y-4">
              <div className="text-[11px] font-mono tracking-[0.25em] text-[#666666] uppercase pb-1 border-b border-white/5">
                {cat.label}
              </div>

              {items.length === 0 ? (
                <div className="text-xs font-mono text-[#444444] py-2">
                  No memory records in this section.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 group flex items-start justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="text-xs font-mono font-semibold text-white tracking-wide">
                          {item.title}
                        </div>
                        <div className="text-xs font-sans text-[#888888] leading-relaxed">
                          {item.content}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMemory(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#555555] hover:text-white transition-opacity cursor-pointer p-1"
                        title="Delete memory fragment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#070709] border border-white/15 p-6 rounded-xs space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                INDEX NEW MEMORY
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
                  CATEGORY
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MemoryCategory)}
                  className="w-full bg-[#0D0D10] border border-white/15 p-2 text-white rounded-xs focus:border-white focus:outline-hidden"
                >
                  <option value="personal">PERSONAL CONTEXT</option>
                  <option value="preferences">PREFERENCES</option>
                  <option value="project">PROJECT CONTEXT</option>
                  <option value="notes">IMPORTANT NOTES</option>
                </select>
              </div>

              <div>
                <label className="block text-[#777777] uppercase text-[10px] mb-1">
                  TITLE
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Current focus"
                  className="w-full bg-[#0D0D10] border border-white/15 p-2.5 text-white rounded-xs focus:border-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#777777] uppercase text-[10px] mb-1">
                  CONTENT
                </label>
                <textarea
                  rows={3}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Knowledge text or preference..."
                  className="w-full bg-[#0D0D10] border border-white/15 p-2.5 text-white rounded-xs focus:border-white focus:outline-hidden resize-none font-sans"
                />
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
                  INDEX
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
