
import React, { useState, useEffect, useRef } from 'react';
import { Project, User, UserRole, ProjectStatus, Notification } from './types';
import { INITIAL_PROJECTS, CATEGORIES } from './constants';
import ProjectCard from './components/ProjectCard';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import LandingPage from './pages/LandingPage';
import AuthFlow from './pages/AuthFlow';
import UserProfile from './pages/UserProfile';
import ReputationRegistry from './pages/ReputationRegistry';
import Archive from './pages/Archive';
import AdminHub from './pages/AdminHub';
import { dbService } from './services/dbService';
import { Search, Plus, Bell, LogOut, Shield, Database, LayoutGrid, BookOpen, Trophy, ChevronDown, Check, Activity, Globe, Cpu, User as UserIcon, X, Info, CheckCircle, AlertCircle, DollarSign, Briefcase, Gavel } from 'lucide-react';

const ADMIN_EMAILS = [
  "admin@crowdfundx.dev",
  "faculty@college.edu",
  "your-email@example.com" // Update this with your actual email
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'explore' | 'details' | 'create' | 'profile' | 'registry' | 'archive' | 'admin'>('landing');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<UserRole | undefined>(undefined);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const token = dbService.getToken();
      if (token) {
        const user = await dbService.getCurrentUser();
        if (user) setCurrentUser(user);
        else dbService.clearSession();
      }
      const savedProjects = await dbService.getProjects(INITIAL_PROJECTS);
      setProjects(savedProjects);
    };
    loadInitialData();

    const syncInterval = setInterval(async () => {
      const freshProjects = await dbService.getProjects(projects);
      if (JSON.stringify(freshProjects) !== JSON.stringify(projects)) {
        setProjects(freshProjects);
      }
      if (currentUser?.email) {
        const freshUser = await dbService.getCurrentUser();
        if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(freshUser);
        }
      }
    }, 15000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(syncInterval);
    };
  }, [currentUser?.email, projects.length]);

  useEffect(() => {
    if (projects.length > 0) dbService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (currentUser) dbService.saveUser(currentUser);
  }, [currentUser]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addNotification = async (targetUserId: string, notifData: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId'>) => {
    const newNotif: Notification = {
      ...notifData,
      id: `n-${Date.now()}`,
      userId: targetUserId,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (currentUser && targetUserId === currentUser.id) {
      setCurrentUser({
        ...currentUser,
        notifications: [newNotif, ...(currentUser.notifications || [])]
      });
    }

    // Sync notification to MongoDB for the target user
    await dbService.sendNotification(targetUserId, newNotif);
  };

  const markNotifRead = async (id: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      notifications: (currentUser.notifications || []).map(n => n.id === id ? { ...n, read: true } : n)
    };
    setCurrentUser(updatedUser);
    await dbService.saveUser(updatedUser);
  };

  const handleAuthComplete = async (authData: any) => {
    const user = authData.user || authData;
    const token = authData.token;
    
    if (ADMIN_EMAILS.includes(user.email)) {
      user.role = [...user.role, UserRole.ADMIN];
    }
    
    setCurrentUser(user);
    dbService.saveSession(user, token);
    setShowAuth(false);
    addToast(`Authenticated as ${user.name}`, 'success');
    if (pendingIntent === UserRole.CREATOR) setView('create');
    setPendingIntent(undefined);
  };

  const logout = () => {
    setCurrentUser(null);
    dbService.clearUser();
    dbService.clearSession();
    setView('landing');
    addToast("Logged out of the registry spine.", 'info');
  };

  const handleStartProject = () => {
    if (!currentUser || !currentUser.role || !currentUser.role.includes(UserRole.CREATOR)) {
      setPendingIntent(UserRole.CREATOR);
      setShowAuth(true);
    } else {
      setView('create');
    }
  };

  const handleCreateProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    setView('explore');
    addToast("Project Node Launched Successfully", 'success');
    addNotification(currentUser!.id, {
      type: 'SYSTEM',
      title: 'Project Created',
      message: `Your project "${newProject.title}" is now active in the spine.`
    });
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prevProjects => prevProjects.map(p => p.id === updated.id ? updated : p));
    dbService.updateProject(updated.id, updated);
  };

  const handleApproveAction = async (notif: Notification) => {
    if (!currentUser) return;
    const project = projects.find(p => p.id === notif.link?.id);
    if (!project) return;

    let updatedProject = { ...project };
    const itemId = notif.link?.itemId;
    const applicantId = notif.applicantId;

    if (notif.type === 'FUNDING') {
      const anchor = project.pendingAnchors.find(a => a.id === itemId || a.userId === applicantId);
      if (anchor && anchor.status === 'PENDING') {
        updatedProject = {
          ...project,
          pendingAnchors: project.pendingAnchors.map(a => a.id === anchor.id ? { ...a, status: 'APPROVED' as const } : a),
          fundingRaised: Number(project.fundingRaised) + Number(anchor.amount),
          backerIds: [...new Set([...project.backerIds, anchor.userId])],
          auditHistory: [...project.auditHistory, {
            id: `aud-${Date.now()}`,
            action: 'CAPITAL_ANCHOR_APPROVED' as const,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            details: `Approved ₹${anchor.amount.toLocaleString('en-IN')} capital from ${anchor.userName}`
          }]
        };
        // Notify the contributor
        await addNotification(anchor.userId, {
          type: 'FUNDING',
          title: 'Capital Approved',
          message: `Your ₹${anchor.amount.toLocaleString('en-IN')} contribution to "${project.title}" has been approved!`,
          link: { view: 'details', id: project.id }
        });
      }
    } else if (notif.type === 'SKILL_APPLICATION') {
      const skillApp = project.skillContributors.find(s => s.id === itemId || s.userId === applicantId);
      if (skillApp && skillApp.status === 'PENDING') {
        updatedProject = {
          ...project,
          skillContributors: project.skillContributors.map(s => s.id === skillApp.id ? { ...s, status: 'APPROVED' as const } : s),
          auditHistory: [...project.auditHistory, {
            id: `aud-${Date.now()}`,
            action: 'SKILL_APPROVED' as const,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            details: `Approved ${skillApp.userName} as ${skillApp.specificSkill} contributor`
          }]
        };
        // Notify the skill contributor
        await addNotification(skillApp.userId, {
          type: 'SKILL_APPLICATION',
          title: 'Application Approved',
          message: `Your application for ${skillApp.specificSkill} on "${project.title}" has been approved!`,
          link: { view: 'details', id: project.id }
        });
      }
    }

    handleUpdateProject(updatedProject);
    markNotifRead(notif.id);
    addToast("Application Approved & Synced", 'success');
  };

  const handleDenyAction = async (notif: Notification) => {
    if (!currentUser) return;
    const project = projects.find(p => p.id === notif.link?.id);
    if (!project) return;

    let updatedProject = { ...project };
    const itemId = notif.link?.itemId;
    const applicantId = notif.applicantId;

    if (notif.type === 'FUNDING') {
      const anchor = project.pendingAnchors.find(a => a.id === itemId || a.userId === applicantId);
      if (anchor) {
        updatedProject = {
          ...project,
          pendingAnchors: project.pendingAnchors.map(a => a.id === anchor.id ? { ...a, status: 'REJECTED' as const } : a),
          auditHistory: [...project.auditHistory, {
            id: `aud-${Date.now()}`,
            action: 'CAPITAL_ANCHOR_REJECTED' as const,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            details: `Rejected ₹${anchor.amount.toLocaleString('en-IN')} capital from ${anchor.userName}`
          }]
        };
        // Notify the contributor
        await addNotification(anchor.userId, {
          type: 'FUNDING',
          title: 'Capital Rejected',
          message: `Your ₹${anchor.amount.toLocaleString('en-IN')} contribution to "${project.title}" was not approved.`,
          link: { view: 'details', id: project.id }
        });
      }
    } else if (notif.type === 'SKILL_APPLICATION') {
      const skillApp = project.skillContributors.find(s => s.id === itemId || s.userId === applicantId);
      if (skillApp) {
        updatedProject = {
          ...project,
          skillContributors: project.skillContributors.map(s => s.id === skillApp.id ? { ...s, status: 'REJECTED' as const } : s)
        };
        // Notify the skill contributor
        await addNotification(skillApp.userId, {
          type: 'SKILL_APPLICATION',
          title: 'Application Denied',
          message: `Your application for ${skillApp.specificSkill} on "${project.title}" was not approved.`,
          link: { view: 'details', id: project.id }
        });
      }
    }

    handleUpdateProject(updatedProject);
    markNotifRead(notif.id);
    addToast("Application Denied", 'info');
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setView('profile');
    setShowNotifications(false);
  };

  const filteredProjects = projects.filter((p, index, self) => {
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.skillsNeeded.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const isFirstAppearance = self.findIndex(t => t.id === p.id) === index;
    return matchesCategory && matchesSearch && isFirstAppearance;
  });

  // Category-specific projects for the Discover view
  const categorizedProjects = CATEGORIES.reduce((acc, cat) => {
    const catProjects = projects.filter(p => p.category === cat);
    // Remove duplicates within the category as well
    acc[cat] = catProjects.filter((p, index, self) => self.findIndex(t => t.id === p.id) === index);
    return acc;
  }, {} as Record<string, Project[]>);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const unreadCount = currentUser?.notifications?.filter(n => !n.read).length || 0;
  const isAdmin = currentUser?.role?.includes(UserRole.ADMIN);

  if (view === 'landing') return (
    <>
      <LandingPage onExplore={() => setView('explore')} onStart={handleStartProject} />
      {showAuth && <AuthFlow onComplete={handleAuthComplete} onCancel={() => setShowAuth(false)} initialIntent={pendingIntent} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      {showAuth && <AuthFlow onComplete={handleAuthComplete} onCancel={() => setShowAuth(false)} initialIntent={pendingIntent} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <nav className="sticky top-0 z-[100] glass-ui border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center transition-all group-hover:scale-95">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">CrowdFundX</span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {[
              { id: 'explore', label: 'Discover' },
              { id: 'registry', label: 'Reputation' },
              { id: 'archive', label: 'Library' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => { setView(item.id as any); setSelectedProjectId(null); }} 
                className={`text-[13px] font-semibold transition-all ${view === item.id ? 'text-cobalt' : 'text-slate-400 hover:text-ink'}`}
              >
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button 
                onClick={() => { setView('admin'); setSelectedProjectId(null); }} 
                className={`text-[13px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${view === 'admin' ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
              >
                <Gavel className="w-4 h-4" /> Admin Hub
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={handleStartProject} 
            className="hidden sm:flex items-center gap-2 bg-ink text-white px-5 py-2 rounded-full text-[13px] font-bold btn-premium"
          >
            Launch Project
          </button>
          
          <div className="flex items-center gap-4 border-l border-border pl-8 relative" ref={notificationRef}>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-ink relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-14 right-0 w-80 bg-white border border-border rounded-3xl shadow-2xl z-[101] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-5 border-b border-border flex justify-between items-center bg-slate-50">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Registry Pulses</h4>
                      <span className="bg-cobalt text-white text-[9px] font-black px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {(currentUser.notifications || []).length === 0 ? (
                        <div className="p-10 text-center space-y-2">
                          <Info className="w-6 h-6 text-slate-200 mx-auto" />
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No activity pulses</p>
                        </div>
                      ) : (
                        currentUser.notifications?.map(n => (
                          <div 
                            key={n.id} 
                            className={`p-5 border-b border-slate-50 transition-colors flex flex-col gap-4 ${!n.read ? 'bg-cobalt/[0.02]' : ''}`}
                          >
                            <div className="flex gap-4">
                              <div className="mt-1">
                                {n.type === 'FUNDING' && <DollarSign className="w-4 h-4 text-emerald-500" />}
                                {n.type === 'SKILL_APPLICATION' && <Briefcase className="w-4 h-4 text-cobalt" />}
                                {n.type === 'SYSTEM' && <Activity className="w-4 h-4 text-slate-400" />}
                              </div>
                              <div className="space-y-1 text-left flex-1">
                                <p className={`text-[11px] font-black uppercase tracking-tight ${!n.read ? 'text-ink' : 'text-slate-400'}`}>{n.title}</p>
                                <p className={`text-[11px] ${!n.read ? 'text-slate-500' : 'text-slate-400'} font-medium leading-tight`}>{n.message}</p>
                                <p className="text-[9px] font-mono text-slate-300">{new Date(n.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                            
                            {/* Action Buttons for Pending Approvals - only show for actionable notifications */}
                            {(n.type === 'FUNDING' || n.type === 'SKILL_APPLICATION') && n.applicantId && n.link?.id && !n.read && (() => {
                              const proj = projects.find(p => p.id === n.link?.id);
                              if (!proj) return null;
                              // Check if the item is still pending
                              if (n.type === 'FUNDING') {
                                const anchor = proj.pendingAnchors.find(a => a.id === n.link?.itemId || a.userId === n.applicantId);
                                if (!anchor || anchor.status !== 'PENDING') return null;
                              } else {
                                const skillApp = proj.skillContributors.find(s => s.id === n.link?.itemId || s.userId === n.applicantId);
                                if (!skillApp || skillApp.status !== 'PENDING') return null;
                              }
                              return (
                              <div className="flex gap-2 ml-8">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveAction(n);
                                  }}
                                  className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDenyAction(n);
                                  }}
                                  className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-rose-600 transition-colors"
                                >
                                  Deny
                                </button>
                              </div>
                              );
                            })()}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div 
                  className="flex items-center gap-3 cursor-pointer group" 
                  onClick={() => handleViewProfile(currentUser.id)}
                >
                  <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full object-cover border border-border shadow-sm group-hover:scale-105 transition-transform" />
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-[13px] font-bold hover:text-cobalt transition-colors">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <main className={`w-full ${view === 'details' ? '' : 'max-w-7xl mx-auto px-6 md:px-12'} py-16 md:py-24`}>
        {view === 'explore' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 text-left">
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase">Explore Registry</h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed italic">Accountability-first projects backed by verifiable outcomes.</p>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Search skills or projects..." 
                  className="pl-12 pr-6 py-4 bg-white border border-border rounded-2xl text-sm w-full outline-none focus:ring-4 focus:ring-cobalt/5 transition-all" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
              <button onClick={() => setFilterCategory('All')} className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${filterCategory === 'All' ? 'bg-ink text-white' : 'bg-white border border-border text-slate-400 hover:border-slate-300'}`}>All Categories</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-ink text-white' : 'bg-white border border-border text-slate-400 hover:border-slate-300'}`}>{cat}</button>
              ))}
            </div>

            {filterCategory === 'All' && !searchQuery ? (
              <div className="space-y-24">
                {CATEGORIES.map(cat => {
                  const catProjects = categorizedProjects[cat] || [];
                  if (catProjects.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-10">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{cat}</h2>
                          <p className="text-sm text-slate-400 font-medium italic">Latest pulses in {cat.toLowerCase()} architecture.</p>
                        </div>
                        <button 
                          onClick={() => setFilterCategory(cat)}
                          className="text-[11px] font-black uppercase tracking-widest text-cobalt hover:text-ink transition-colors flex items-center gap-2"
                        >
                          View All Nodes <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {catProjects.slice(0, 3).map(project => (
                          <ProjectCard key={project.id} project={project} onClick={(id) => { setSelectedProjectId(id); setView('details'); }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onClick={(id) => { setSelectedProjectId(id); setView('details'); }} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <Info className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-xl font-black text-slate-300 uppercase tracking-widest">No matching nodes found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'details' && selectedProject && (
          <ProjectDetails 
            project={selectedProject} 
            currentUser={currentUser} 
            onBack={() => setView('explore')} 
            onUpdateProject={handleUpdateProject} 
            onRequestAuth={(role) => { setPendingIntent(role); setShowAuth(true); }} 
            onViewProfile={handleViewProfile}
            onAddNotification={addNotification}
            onAddToast={addToast}
          />
        )}

        {view === 'profile' && selectedUserId && (
          <UserProfile 
            userId={selectedUserId} 
            projects={projects} 
            currentUser={currentUser} 
            onBack={() => setView('explore')} 
            onSelectProject={(id) => { setSelectedProjectId(id); setView('details'); }} 
          />
        )}

        {view === 'registry' && (
          <ReputationRegistry 
            projects={projects} 
            currentUser={currentUser} 
            onSelectUser={handleViewProfile} 
          />
        )}

        {view === 'archive' && (
          <Archive 
            projects={projects} 
            onSelectProject={(id) => { setSelectedProjectId(id); setView('details'); }} 
          />
        )}

        {view === 'admin' && isAdmin && (
          <AdminHub 
            projects={projects}
            onUpdateProject={handleUpdateProject}
            onAddToast={addToast}
            currentUser={currentUser!}
          />
        )}

        {view === 'create' && currentUser && (
          <CreateProject 
            creator={currentUser} 
            onCancel={() => setView('explore')} 
            onSuccess={handleCreateProject} 
          />
        )}
      </main>

      <footer className="border-t border-border bg-white px-6 md:px-12 py-16 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 text-left">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
               <Shield className="w-7 h-7 text-cobalt" />
               <span className="text-xl font-bold tracking-tight">CrowdFundX</span>
             </div>
             <p className="text-slate-400 text-sm leading-relaxed max-w-xs">A professional registry for milestone-driven growth and collective intelligence.</p>
          </div>
          <div className="grid grid-cols-2 gap-12 md:gap-24">
            <div className="space-y-4">
               <p className="text-[12px] font-bold text-ink uppercase tracking-widest">Platform</p>
               <ul className="space-y-3 text-sm text-slate-400 font-medium">
                 <li className="hover:text-cobalt cursor-pointer transition-colors" onClick={() => setView('explore')}>Trust Registry</li>
                 <li className="hover:text-cobalt cursor-pointer transition-colors" onClick={() => setView('registry')}>Specialist Search</li>
                 <li className="hover:text-cobalt cursor-pointer transition-colors" onClick={() => setView('archive')}>Audit History</li>
               </ul>
            </div>
            <div className="space-y-4">
               <p className="text-[12px] font-bold text-ink uppercase tracking-widest">Company</p>
               <ul className="space-y-3 text-sm text-slate-400 font-medium">
                 <li className="hover:text-cobalt cursor-pointer transition-colors">Ethics Protocol</li>
                 <li className="hover:text-cobalt cursor-pointer transition-colors">Case Studies</li>
                 <li className="hover:text-cobalt cursor-pointer transition-colors">Privacy</li>
                 {currentUser && (
                   <li className="text-rose-500 font-bold flex items-center gap-2 hover:opacity-70 cursor-pointer" onClick={logout}>
                     <LogOut className="w-4 h-4" /> Log Out Spine
                   </li>
                 )}
               </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) => {
  return (
    <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300 min-w-[300px] border ${
            toast.type === 'success' ? 'bg-white border-emerald-100' : 
            toast.type === 'error' ? 'bg-white border-rose-100' : 'bg-white border-cobalt/10'
          }`}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cobalt" />}
          </div>
          <p className="flex-1 text-sm font-bold text-ink text-left">{toast.message}</p>
          <button 
            onClick={() => onRemove(toast.id)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-ink transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default App;
