
import React from 'react';
import { Project, ProjectStatus, User, UserRole } from '../types';
import { Shield, Gavel, Snowflake, Play, UserX, UserCheck, Activity, Search, AlertCircle, FileText } from 'lucide-react';

interface AdminHubProps {
  projects: Project[];
  onUpdateProject: (p: Project) => void;
  onAddToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  currentUser: User;
}

const AdminHub: React.FC<AdminHubProps> = ({ projects, onUpdateProject, onAddToast, currentUser }) => {
  const toggleFreeze = (project: Project) => {
    if (project.status === ProjectStatus.UNDER_REVIEW) {
      onUpdateProject({
        ...project,
        status: project.previousStatus || ProjectStatus.ACTIVE,
        auditHistory: [
          ...project.auditHistory,
          {
            id: `adm-${Date.now()}`,
            action: 'PROJECT_UNFROZEN_BY_ADMIN',
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            details: "Manual unfreeze intervention node."
          }
        ]
      });
      onAddToast(`Restored node: ${project.title}`, 'success');
    } else {
      onUpdateProject({
        ...project,
        previousStatus: project.status,
        status: ProjectStatus.UNDER_REVIEW,
        auditHistory: [
          ...project.auditHistory,
          {
            id: `adm-${Date.now()}`,
            action: 'PROJECT_FROZEN_BY_ADMIN',
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            details: "Administrative freeze for system integrity review."
          }
        ]
      });
      onAddToast(`Frozen node: ${project.title}`, 'info');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 text-left">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full">
          <Gavel className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Global Intervention Hub</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Admin Registry Control</h1>
        <p className="text-slate-500 font-medium text-lg italic">System-level controls for institutional integrity and dispute resolution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[3.5rem] shadow-xl shadow-slate-100/50 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Node Suspension Management</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400">
                {projects.length} Registered Nodes
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 border-b border-slate-100">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-10 py-6">Project Spine</th>
                    <th className="px-6 py-6">Architect</th>
                    <th className="px-6 py-6">Current Status</th>
                    <th className="px-10 py-6 text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <p className="font-black text-slate-900 uppercase tracking-tight">{p.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.id}</p>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm font-bold text-slate-600">{p.creatorName}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          p.status === ProjectStatus.UNDER_REVIEW ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button 
                          onClick={() => toggleFreeze(p)}
                          disabled={p.status === ProjectStatus.COMPLETED || p.status === ProjectStatus.FAILED}
                          className={`p-3 rounded-2xl transition-all disabled:opacity-20 ${
                            p.status === ProjectStatus.UNDER_REVIEW ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {p.status === ProjectStatus.UNDER_REVIEW ? <Play className="w-5 h-5" /> : <Snowflake className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-8">
           <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-full blur-[60px] opacity-20" />
              <div className="space-y-6 relative z-10">
                 <h3 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em] flex items-center gap-3"><AlertCircle className="w-5 h-5" /> Integrity Policy</h3>
                 <p className="text-xs font-medium text-slate-400 leading-relaxed italic">"Admins oversee system integrity. They cannot modify architecture content or financial logic, preserving the principle of immutable process history."</p>
                 <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-slate-500">Frozen Nodes</span><span className="text-xl font-black text-rose-500">{projects.filter(p => p.status === ProjectStatus.UNDER_REVIEW).length}</span></div>
                    <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-slate-500">Audit Logs</span><span className="text-xl font-black text-indigo-400">{projects.reduce((sum, p) => sum + p.auditHistory.length, 0)}</span></div>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-white border border-slate-200 rounded-[3.5rem] space-y-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><FileText className="w-5 h-5" /> Recent Intervention Nodes</h3>
              <div className="space-y-4">
                 {projects.flatMap(p => p.auditHistory.filter(a => a.action.includes('ADMIN'))).sort((a,b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5).map(log => (
                    <div key={log.id} className="p-4 bg-slate-50 rounded-2xl space-y-1">
                       <p className="text-[9px] font-black text-rose-500 uppercase">{log.action}</p>
                       <p className="text-[10px] font-medium text-slate-500 leading-tight">Admin intervention triggered for a spine node.</p>
                       <p className="text-[8px] font-mono text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                 ))}
                 {projects.flatMap(p => p.auditHistory.filter(a => a.action.includes('ADMIN'))).length === 0 && (
                    <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest text-center py-10">No recent interventions</p>
                 )}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminHub;
