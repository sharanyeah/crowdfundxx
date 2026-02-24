
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { Activity, Users, ShieldCheck } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const currentMilestone = project.milestones.find(m => m.status === 'ACTIVE') || 
                           project.milestones.find(m => m.status === 'PENDING') || 
                           project.milestones[project.milestones.length - 1];

  const statusColors = {
    [ProjectStatus.ACTIVE]: 'text-cobalt bg-cobalt/5 border-cobalt/10',
    [ProjectStatus.STALLED]: 'text-amber-600 bg-amber-50 border-amber-100',
    [ProjectStatus.FAILED]: 'text-accent bg-accent/5 border-accent/10',
    [ProjectStatus.COMPLETED]: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    [ProjectStatus.REVIEW]: 'text-slate-400 bg-slate-50 border-slate-200',
  };

  const raisedPercent = Math.min((project.fundingRaised / project.fundingGoal) * 100, 100);

  return (
    <div 
      onClick={() => onClick(project.id)}
      className="bg-white border border-border rounded-3xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all cursor-pointer group flex flex-col justify-between min-h-[440px]"
    >
      <div>
        <div className="flex justify-between items-center mb-8">
          <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border ${statusColors[project.status]}`}>
            {project.status}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Score: {project.reputationScore}</span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-ink mb-3 leading-tight group-hover:text-cobalt transition-colors">
          {project.title}
        </h3>
        <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-3 mb-8 font-medium">
          {project.problem}
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Funding Goal</p>
            <p className="text-[13px] font-bold text-ink">₹{project.fundingRaised.toLocaleString('en-IN')} <span className="text-slate-300">/ ₹{project.fundingGoal.toLocaleString('en-IN')}</span></p>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-cobalt transition-all duration-1000" style={{ width: `${raisedPercent}%` }} />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                    <Users className="w-3 h-3" />
                  </div>
                ))}
             </div>
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{project.skillContributors.length} Specialists</span>
          </div>
          <Activity className="w-4 h-4 text-slate-200 group-hover:text-cobalt transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
