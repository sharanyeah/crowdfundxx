
import React, { useMemo, useState } from 'react';
import { Project, User, UserRole } from '../types';
import { Shield, TrendingUp, Trophy, Search, UserCheck, ShieldCheck, Mail, Globe, Users } from 'lucide-react';

interface ReputationRegistryProps {
  projects: Project[];
  currentUser: User | null;
  onSelectUser: (userId: string) => void;
}

const ReputationRegistry: React.FC<ReputationRegistryProps> = ({ projects, currentUser, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = useMemo(() => {
    const userMap = new Map<string, { 
      id: string; 
      name: string; 
      reputation: number; 
      role: string[]; 
      projectsCount: number; 
      contributionCount: number;
      verification: string;
    }>();

    // Collect creators
    projects.forEach(p => {
      if (!userMap.has(p.creatorId)) {
        userMap.set(p.creatorId, {
          id: p.creatorId,
          name: p.creatorName,
          reputation: p.reputationScore,
          role: ['Architect'],
          projectsCount: 1,
          contributionCount: 0,
          verification: 'Institutional Email'
        });
      } else {
        const u = userMap.get(p.creatorId)!;
        u.projectsCount += 1;
      }
    });

    // Collect skill contributors
    projects.forEach(p => {
      p.skillContributors.forEach(sc => {
        if (!userMap.has(sc.userId)) {
          userMap.set(sc.userId, {
            id: sc.userId,
            name: sc.userName,
            reputation: 80, // Default for mock
            role: ['Specialist'],
            projectsCount: 0,
            contributionCount: 1,
            verification: 'Portfolio Verified'
          });
        } else {
          const u = userMap.get(sc.userId)!;
          u.contributionCount += 1;
          if (!u.role.includes('Specialist')) u.role.push('Specialist');
        }
      });
    });

    return Array.from(userMap.values()).sort((a, b) => b.reputation - a.reputation);
  }, [projects]);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reputation Registry</h1>
          <p className="text-slate-500 font-medium text-lg italic">Global verifiable trust scores for the TrustFund network.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or verification type..." 
            className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs w-full shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Shield className="text-indigo-600" />, label: "Total Proof-Points", val: users.length * 12 },
          { icon: <TrendingUp className="text-emerald-600" />, label: "Network Trust Avg", val: "84.2%" },
          { icon: <Users className="text-slate-900" />, label: "Active Specialists", val: users.filter(u => u.role.includes('Specialist')).length }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-6">Rank & Node</th>
                <th className="px-6 py-6 text-center">Trust Metric</th>
                <th className="px-6 py-6">Verification</th>
                <th className="px-6 py-6 text-right">Lifecycle History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user, idx) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectUser(user.id)}
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <span className="text-lg font-black text-slate-300 w-8">{idx + 1}</span>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xl group-hover:scale-105 transition-transform">{user.name[0]}</div>
                      <div>
                        <p className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{user.name}</p>
                        <div className="flex gap-2 mt-1">
                          {user.role.map(r => (
                            <span key={r} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest">{r}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`text-2xl font-black ${user.reputation > 80 ? 'text-emerald-600' : 'text-slate-600'}`}>{user.reputation}</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${user.reputation > 80 ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${user.reputation}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      {user.verification}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-black text-slate-900">{user.projectsCount} Built • {user.contributionCount} Aided</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consistency: 94%</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReputationRegistry;
