
import React, { useMemo, useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { BookOpen, Search, Filter, History, Target, ArrowUpRight, Lock, CheckCircle2, XCircle } from 'lucide-react';

interface ArchiveProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

const Archive: React.FC<ArchiveProps> = ({ projects, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const archivedProjects = useMemo(() => 
    projects.filter(p => p.status === ProjectStatus.COMPLETED || p.status === ProjectStatus.FAILED),
    [projects]
  );

  const filtered = archivedProjects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Case Archive</h1>
          <p className="text-slate-500 font-medium text-sm italic">Lessons anchored in the execution spine.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter Case Studies..." 
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs w-full shadow-sm outline-none focus:ring-4 focus:ring-indigo-50" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map(p => (
          <div 
            key={p.id} 
            onClick={() => onSelectProject(p.id)}
            className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${p.status === ProjectStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {p.status === ProjectStatus.COMPLETED ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {p.status}
              </div>
              <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category}</p>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{p.title}</h3>
              <p className="text-sm text-slate-500 font-medium italic line-clamp-2">"{p.oneLineSummary}"</p>

              <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Architect</p>
                  <p className="text-xs font-bold text-slate-900">{p.creatorName}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reputation</p>
                  <p className="text-xs font-bold text-indigo-600">{p.reputationScore}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 py-40 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-black uppercase tracking-[0.3em] text-xs">No archived nodes found</div>
        )}
      </div>
    </div>
  );
};

export default Archive;
