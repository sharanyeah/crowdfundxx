
import React, { useMemo } from 'react';
import { User, Project, UserRole, ProjectStatus } from '../types';
import { 
  Shield, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Award, 
  ArrowLeft, 
  Github, 
  Globe, 
  Mail,
  Zap,
  History,
  TrendingUp,
  XCircle,
  Lock,
  Link as LinkIcon
} from 'lucide-react';

interface UserProfileProps {
  userId: string;
  projects: Project[];
  currentUser: User | null;
  onBack: () => void;
  onSelectProject: (projectId: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, projects, currentUser, onBack, onSelectProject }) => {
  const user = useMemo(() => {
    if (currentUser && currentUser.id === userId) return currentUser;
    // Mock user derivation for demo purposes if not the current user
    const creator = projects.find(p => p.creatorId === userId);
    if (creator) {
      return {
        id: creator.creatorId,
        name: creator.creatorName,
        role: [UserRole.CREATOR],
        reputation: creator.reputationScore,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.creatorId}`,
        bio: "Institutional context builder focused on process integrity.",
        currentRole: "Lead Architect",
        workDescription: "Experienced architect focused on sustainable system design and lifecycle integrity in decentralized environments.",
        socialLinks: [{ id: 'l1', label: 'GitHub', url: 'https://github.com' }],
        email: "architect@trust.network"
      } as User;
    }
    return null;
  }, [userId, projects, currentUser]);

  const createdProjects = useMemo(() => 
    projects.filter(p => p.creatorId === userId), 
    [projects, userId]
  );

  const activeContributions = useMemo(() => {
    const list: { project: Project; skill: string; status: string }[] = [];
    projects.forEach(p => {
      const sc = p.skillContributors.find(s => s.userId === userId && s.status === 'APPROVED');
      if (sc) list.push({ project: p, skill: sc.specificSkill, status: sc.status });
    });
    return list;
  }, [projects, userId]);

  const archivedContributions = useMemo(() => {
    const list: { project: Project; skill: string; status: string; note?: string }[] = [];
    projects.forEach(p => {
      const sc = p.skillContributors.find(s => s.userId === userId && (s.status === 'COMPLETED' || s.status === 'ENDED_EARLY'));
      if (sc) list.push({ project: p, skill: sc.specificSkill, status: sc.status, note: sc.completionNote });
    });
    return list;
  }, [projects, userId]);

  if (!user) return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">Memory Record Not Found.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500 text-left">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-[10px] uppercase tracking-widest"><ArrowLeft className="w-3.5 h-3.5" /> Back to Registry</button>

      <div className="bg-white border border-slate-100 rounded-[4rem] p-12 md:p-16 shadow-2xl shadow-slate-100/30 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-40" />
        <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-[3rem] bg-slate-900 overflow-hidden border-4 border-white shadow-3xl shrink-0">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{user.name}</h1>
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2"><Shield className="w-4 h-4" /> REPUTATION {user.reputation}</div>
              </div>
              <p className="text-xl text-indigo-600 font-black uppercase tracking-widest text-[12px]">{user.currentRole}</p>
              <p className="text-2xl text-slate-500 font-medium italic leading-relaxed max-w-4xl">"{user.bio}"</p>
            </div>
            
            <div className="pt-8 border-t border-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Identity Description</p>
               <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-50 pl-8">
                  {user.workDescription || 'No professional description anchored to this identity node.'}
               </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-8 border-t border-slate-50">
              {user.socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" className="flex items-center gap-2.5 text-slate-400 hover:text-indigo-600 font-black text-[11px] uppercase tracking-widest transition-all">
                   <LinkIcon className="w-4 h-4" /> {link.label}
                </a>
              ))}
              <div className="flex items-center gap-2.5 text-slate-400 font-black text-[11px] uppercase tracking-widest"><Mail className="w-4 h-4" /> {user.email}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-950 text-white rounded-[3rem] p-10 space-y-10 shadow-3xl">
            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3"><TrendingUp className="w-5 h-5" /> Performance Analytics</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-4xl font-black">{projects.filter(p => p.creatorId === userId && p.status === ProjectStatus.COMPLETED).length}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completed</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-4xl font-black">{projects.filter(p => p.creatorId === userId && p.status === ProjectStatus.ACTIVE).length + projects.filter(p => p.skillContributors.some(sc => sc.userId === userId && sc.status === 'APPROVED')).length}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-4xl font-black">{createdProjects.length}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architected</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-4xl font-black">{activeContributions.length + archivedContributions.length}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contributions</p>
                </div>
              </div>
              <div className="pt-10 border-t border-white/10 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Lifecycle Integrity</span><span>98%</span></div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5"><div className="h-full bg-indigo-500 rounded-full w-[98%] shadow-lg shadow-indigo-500/50" /></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Verification Pulse</span><span>92%</span></div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5"><div className="h-full bg-emerald-500 rounded-full w-[92%] shadow-lg shadow-emerald-500/50" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-20">
          <section className="space-y-10">
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4"><Briefcase className="w-8 h-8 text-indigo-600" /> Architected Nodes</h3>
            <div className="grid grid-cols-1 gap-6">
              {createdProjects.length === 0 ? <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] text-[10px] font-black text-slate-300 uppercase tracking-widest">No architectures found.</div> : createdProjects.map(p => (
                <div key={p.id} onClick={() => onSelectProject(p.id)} className="group bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all cursor-pointer flex justify-between items-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h4 className="font-black text-slate-900 text-2xl group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{p.title}</h4>
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${p.status === ProjectStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{p.status}</span>
                    </div>
                    <p className="text-lg text-slate-500 font-medium italic">"{p.oneLineSummary}"</p>
                  </div>
                  <ChevronRight className="w-8 h-8 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-10">
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4"><Award className="w-8 h-8 text-indigo-600" /> Verifiable Specialist History</h3>
            <div className="space-y-8">
              {activeContributions.map((c, i) => (
                <div key={i} onClick={() => onSelectProject(c.project.id)} className="bg-white border-2 border-indigo-50 rounded-[3rem] p-10 shadow-md flex items-start gap-10 hover:shadow-2xl transition-all cursor-pointer group">
                  <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black shadow-xl"><Clock className="w-10 h-10" /></div>
                  <div className="space-y-4 flex-1">
                     <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Active Specialism Node: {c.skill}</p>
                     <h4 className="font-black text-slate-900 text-3xl tracking-tight">{c.project.title}</h4>
                     <p className="text-lg text-slate-500 font-medium italic">"Integrating specialized execution logic into the active registry phase."</p>
                  </div>
                </div>
              ))}
              {archivedContributions.map((c, i) => (
                <div key={i} onClick={() => onSelectProject(c.project.id)} className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 flex items-start gap-10 opacity-60 hover:opacity-100 transition-all cursor-pointer">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white ${c.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{c.status === 'COMPLETED' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}</div>
                  <div className="space-y-4 flex-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Concluded Node: {c.skill}</p>
                    <h4 className="font-black text-slate-900 text-3xl tracking-tight">{c.project.title}</h4>
                    {c.note && <p className="text-lg text-slate-400 italic">"{c.note}"</p>}
                  </div>
                </div>
              ))}
              {activeContributions.length === 0 && archivedContributions.length === 0 && <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] text-[10px] font-black text-slate-300 uppercase tracking-widest">No specialist activity detected.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default UserProfile;
