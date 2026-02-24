import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStatus, User, UserRole, ProjectType, Notification, ProjectQA, SkillContribution, PendingAnchor, ProjectUpdate, ExternalLink, Milestone, FinancialNode } from '../types';
import { 
  ArrowLeft, Calendar, DollarSign, Users, CheckCircle2, Clock, 
  AlertCircle, Plus, ShieldCheck, Target, 
  Shield, Info, XCircle, Send, LayoutDashboard, Check, X, 
  MessageSquare, Activity, Quote, Map, Lock,
  FileText, History, Gift, ChevronRight, PieChart, Briefcase, User as UserIcon, Share2, 
  Cpu, Microscope, Heart, Lightbulb, Zap, TrendingUp, AlertTriangle, Copy, CheckCircle,
  Gavel, Eye, EyeOff, Ban, Flag, Smartphone, RefreshCw, Upload, Terminal, Trash2, Globe, Edit3, Save, ExternalLink as ExternalLinkIcon, Image as ImageIcon, Mail, Award, BookOpen, Layers, Coins, Snowflake, Play,
  BarChart3, Scale, Search, Link as LinkIcon, ArrowUpRight
} from 'lucide-react';

interface ProjectDetailsProps {
  project: Project;
  currentUser: User | null;
  onBack: () => void;
  onUpdateProject: (p: Project) => void;
  onRequestAuth: (role?: UserRole) => void;
  onViewProfile: (userId: string) => void;
  onAddNotification: (targetUserId: string, notif: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId'>) => void;
  onAddToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

type ProjectScopedRole = 'PUBLIC_AUDITOR' | 'REGISTERED' | 'CAPITAL_CONTRIBUTOR' | 'SKILL_CONTRIBUTOR' | 'ARCHITECT' | 'SYSTEM_ADMIN';

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  project, 
  currentUser, 
  onBack, 
  onUpdateProject, 
  onRequestAuth, 
  onViewProfile,
  onAddNotification,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'updates' | 'finances' | 'registry' | 'integrity' | 'inquiry'>('overview');
  const [questionText, setQuestionText] = useState('');
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [editForm, setEditForm] = useState<Project>({ ...project });
  const [pulseForm, setPulseForm] = useState<Partial<ProjectUpdate>>({
    summary: '',
    done: '',
    changed: '',
    blocked: '',
    evidence: [''],
    milestoneId: project.milestones[0]?.id || ''
  });
  const [editingPulseId, setEditingPulseId] = useState<string | null>(null);

  const [capitalStep, setCapitalStep] = useState<'AMOUNT' | 'QR' | 'CONFIRM' | 'SUCCESS'>('AMOUNT');
  const [capitalAmount, setCapitalAmount] = useState<string>('1000');
  const [qrExpiry, setQrExpiry] = useState(60);
  const [upiRefId, setUpiRefId] = useState('');
  const [qrTimerActive, setQrTimerActive] = useState(false);

  const [skillForm, setSkillForm] = useState({
    skill: project.skillsNeeded[0] || '',
    portfolio: currentUser?.portfolio || '',
    commitment: '15h / week',
    tasks: ''
  });

  const scopedRole = useMemo((): ProjectScopedRole => {
    if (!currentUser || !currentUser.role) return 'PUBLIC_AUDITOR';
    if (currentUser.role.includes(UserRole.ADMIN)) return 'SYSTEM_ADMIN';
    if (currentUser.id === project.creatorId) return 'ARCHITECT';
    const skillMatch = project.skillContributors?.find(sc => sc.userId === currentUser.id && sc.status === 'APPROVED');
    if (skillMatch) return 'SKILL_CONTRIBUTOR';
    if (project.backerIds?.includes(currentUser.id)) return 'CAPITAL_CONTRIBUTOR';
    return 'REGISTERED';
  }, [project, currentUser]);

  const isCreator = scopedRole === 'ARCHITECT';
  const isGlobalAdmin = scopedRole === 'SYSTEM_ADMIN';
  const isClosed = project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.FAILED;
  const isFrozen = project.status === ProjectStatus.UNDER_REVIEW;
  const canModify = !isFrozen && !isClosed;
  
  const fundingProgress = (project.fundingRaised / project.fundingGoal) * 100;

  const integrityMetrics = useMemo(() => {
    const lastUpdateDate = new Date(project.lastUpdate);
    const now = new Date();
    const daysSinceLastUpdate = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let healthStatus: 'Active' | 'At Risk' | 'Stalled' = 'Active';
    let healthColor = 'text-emerald-500';
    if (daysSinceLastUpdate > 21) {
      healthStatus = 'Stalled';
      healthColor = 'text-rose-500';
    } else if (daysSinceLastUpdate > 8) {
      healthStatus = 'At Risk';
      healthColor = 'text-amber-500';
    }

    const milestoneTotal = project.milestones.length;
    const milestoneDone = project.milestones.filter(m => m.status === 'COMPLETED').length;
    const milestoneProgressRatio = milestoneTotal > 0 ? (milestoneDone / milestoneTotal) * 100 : 0;

    const totalUpdates = project.updates.length;
    const updatesWithBlockers = project.updates.filter(u => u.blocked && u.blocked.trim().length > 0).length;
    const transparencyRatio = totalUpdates > 0 ? (updatesWithBlockers / totalUpdates) * 100 : 0;
    
    let transparencyLabel = 'No Data';
    if (totalUpdates > 0) {
      if (transparencyRatio === 0) transparencyLabel = 'Suspicious (None reported)';
      else if (transparencyRatio <= 40) transparencyLabel = 'Healthy Transparency';
      else transparencyLabel = 'Struggling but Honest';
    }

    const milestoneEdits = project.auditHistory.filter(a => a.action === 'ARCHITECT_REVISION').length;
    const stabilityScore = milestoneTotal > 0 ? (milestoneEdits / milestoneTotal) : 0;
    let stabilityClass = 'Stable';
    if (stabilityScore > 1.0) stabilityClass = 'Volatile';
    else if (stabilityScore > 0.4) stabilityClass = 'Moderate';

    const totalRaised = project.fundingRaised;
    const allocatedAmount = project.financialBreakdown
      .filter(f => f.status === 'ALLOCATED' || f.status === 'SPENT')
      .reduce((sum, f) => sum + f.amount, 0);
    const allocationCoverage = totalRaised > 0 ? (allocatedAmount / totalRaised) * 100 : 0;
    
    let allocationStatus = 'Poorly Allocated';
    if (allocationCoverage >= 90) allocationStatus = 'Fully Allocated';
    else if (allocationCoverage >= 40) allocationStatus = 'Partially Allocated';

    const spentItems = project.financialBreakdown.filter(f => f.status === 'SPENT');
    const isTraceable = spentItems.length === 0 || spentItems.every(f => f.description.length > 10);
    const expectedUpdates = project.duration ? parseInt(project.duration) * 4 : 24; 
    const consistencyScore = Math.min((totalUpdates / expectedUpdates) * 100, 100);
    
    return {
      daysSinceLastUpdate, healthStatus, healthColor, milestoneProgressRatio,
      transparencyRatio, transparencyLabel, stabilityClass,
      allocationCoverage, allocationStatus, isTraceable, consistencyScore,
      milestoneDone, milestoneTotal
    };
  }, [project]);

  useEffect(() => {
    let timer: any;
    if (qrTimerActive && qrExpiry > 0) {
      timer = setInterval(() => setQrExpiry(prev => prev - 1), 1000);
    } else if (qrExpiry === 0) setQrTimerActive(false);
    return () => clearInterval(timer);
  }, [qrTimerActive, qrExpiry]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    onAddToast("Registry Case Link Copied", 'success');
  };

  const handleFreeze = () => {
    if (!isGlobalAdmin) return;
    onUpdateProject({
      ...project,
      previousStatus: project.status,
      status: ProjectStatus.UNDER_REVIEW,
      auditHistory: [
        ...project.auditHistory,
        {
          id: `au-${Date.now()}`,
          action: 'PROJECT_FROZEN_BY_ADMIN',
          timestamp: new Date().toISOString(),
          userId: currentUser!.id,
          details: "Administrative freeze triggered."
        }
      ]
    });
    onAddToast("Project Frozen", 'info');
  };

  const handleUnfreeze = () => {
    if (!isGlobalAdmin) return;
    onUpdateProject({
      ...project,
      status: project.previousStatus || ProjectStatus.ACTIVE,
      auditHistory: [
        ...project.auditHistory,
        {
          id: `au-${Date.now()}`,
          action: 'PROJECT_UNFROZEN_BY_ADMIN',
          timestamp: new Date().toISOString(),
          userId: currentUser!.id,
          details: `Global admin restored project.`
        }
      ]
    });
    onAddToast("Project Restored", 'success');
  };

  const handleSaveEdit = () => {
    onUpdateProject({
      ...editForm,
      lastUpdate: new Date().toISOString(),
      fundingGoal: editForm.financialBreakdown.reduce((sum, f) => sum + Number(f.amount), 0),
      auditHistory: [
        ...editForm.auditHistory,
        { id: `au-${Date.now()}`, action: 'ARCHITECT_REVISION', timestamp: new Date().toISOString(), userId: currentUser!.id, details: "Full architecture revision pulsed." }
      ]
    });
    setShowEditModal(false);
    onAddToast("Architecture Revised", 'success');
  };

  const handleSavePulse = () => {
    if (!pulseForm.summary || !pulseForm.done) {
      onAddToast("Summary and Done fields are required", 'error');
      return;
    }
    const filteredEvidence = (pulseForm.evidence || []).filter(e => e.trim() !== '');
    
    let updatedUpdates = [...project.updates];
    if (editingPulseId) {
      updatedUpdates = updatedUpdates.map(u => u.id === editingPulseId ? { ...(pulseForm as ProjectUpdate), id: editingPulseId, timestamp: u.timestamp, evidence: filteredEvidence } : u);
    } else {
      updatedUpdates = [{ 
        id: `pulse-${Date.now()}`, 
        timestamp: new Date().toISOString(), 
        summary: pulseForm.summary || '', 
        done: pulseForm.done || '', 
        changed: pulseForm.changed || '', 
        blocked: pulseForm.blocked || '', 
        evidence: filteredEvidence, 
        milestoneId: pulseForm.milestoneId || '' 
      }, ...updatedUpdates];
    }

    const updatedProject = {
      ...project,
      updates: updatedUpdates,
      lastUpdate: new Date().toISOString(),
      auditHistory: [
        ...project.auditHistory,
        { 
          id: `au-${Date.now()}`, 
          action: (editingPulseId ? 'ARCHITECT_REVISION' : 'UPDATE_POSTED') as any, 
          timestamp: new Date().toISOString(), 
          userId: currentUser!.id, 
          details: editingPulseId ? "Pulse revised." : "New pulse anchored." 
        }
      ]
    };
    onUpdateProject(updatedProject);
    setShowPulseModal(false);
    setEditingPulseId(null);
    onAddToast(editingPulseId ? "Pulse Revised" : "Pulse Anchored", 'success');
  };

  const openNewPulseModal = () => {
    setPulseForm({ summary: '', done: '', changed: '', blocked: '', evidence: [''], milestoneId: project.milestones[0]?.id || '' });
    setEditingPulseId(null);
    setShowPulseModal(true);
  };

  const openEditPulseModal = (update: ProjectUpdate) => {
    setPulseForm({ ...update });
    setEditingPulseId(update.id);
    setShowPulseModal(true);
  };

  const postQuestion = () => {
    if (!currentUser) { onRequestAuth(); return; }
    if (!questionText.trim()) return;
    onUpdateProject({ ...project, qa: [{ id: `qa-${Date.now()}`, userId: currentUser.id, userName: currentUser.name, question: questionText, timestamp: new Date().toISOString() }, ...project.qa] });
    setQuestionText('');
    onAddToast("Inquiry Transmitted", 'success');
  };

  const postAnswer = (qaId: string) => {
    const ans = answerTexts[qaId];
    if (!ans?.trim()) return;
    onUpdateProject({ ...project, qa: project.qa.map(q => q.id === qaId ? { ...q, answer: ans } : q) });
    setAnswerTexts({ ...answerTexts, [qaId]: '' });
    onAddToast("Response Anchored", 'success');
  };

  const approveSpecialist = (id: string) => {
    const skillApp = project.skillContributors.find(s => s.id === id);
    if (!skillApp) return;
    
    const updatedProject = { 
      ...project, 
      skillContributors: project.skillContributors.map(s => s.id === id ? { ...s, status: 'APPROVED' as const } : s),
      auditHistory: [
        ...project.auditHistory,
        {
          id: `aud-${Date.now()}`,
          action: 'SKILL_APPROVED' as const,
          timestamp: new Date().toISOString(),
          userId: currentUser!.id,
          details: `Approved ${skillApp.userName} as ${skillApp.specificSkill} contributor`
        }
      ]
    };
    onUpdateProject(updatedProject);
    
    // Notify the skill contributor
    onAddNotification(skillApp.userId, {
      type: 'SKILL_APPLICATION',
      title: 'Application Approved',
      message: `Your application for ${skillApp.specificSkill} on "${project.title}" has been approved!`,
      link: { view: 'details', id: project.id }
    });
    
    onAddToast(`Specialist Approved`, 'success');
  };

  const denySpecialist = (id: string) => {
    const skillApp = project.skillContributors.find(s => s.id === id);
    if (!skillApp) return;

    const updatedProject = { 
      ...project, 
      skillContributors: project.skillContributors.map(s => s.id === id ? { ...s, status: 'REJECTED' as const } : s) 
    };
    onUpdateProject(updatedProject);

    // Notify the skill contributor
    onAddNotification(skillApp.userId, {
      type: 'SKILL_APPLICATION',
      title: 'Application Denied',
      message: `Your application for ${skillApp.specificSkill} on "${project.title}" was not approved.`,
      link: { view: 'details', id: project.id }
    });

    onAddToast("Specialist application denied", 'info');
  };

  const approveCapital = (id: string) => {
    const anchor = project.pendingAnchors.find(a => a.id === id);
    if (!anchor || anchor.status !== 'PENDING') return;

    const updatedProject = {
      ...project,
      pendingAnchors: project.pendingAnchors.map(a => a.id === id ? { ...a, status: 'APPROVED' as const } : a),
      fundingRaised: Number(project.fundingRaised) + Number(anchor.amount),
      backerIds: [...new Set([...project.backerIds, anchor.userId])],
      auditHistory: [
        ...project.auditHistory,
        {
          id: `aud-${Date.now()}`,
          action: 'CAPITAL_ANCHOR_APPROVED' as const,
          timestamp: new Date().toISOString(),
          userId: currentUser!.id,
          details: `Approved ₹${anchor.amount.toLocaleString('en-IN')} capital from ${anchor.userName}`
        }
      ]
    };
    onUpdateProject(updatedProject);

    // Notify the contributor
    onAddNotification(anchor.userId, {
      type: 'FUNDING',
      title: 'Capital Approved',
      message: `Your ₹${anchor.amount.toLocaleString('en-IN')} contribution to "${project.title}" has been approved!`,
      link: { view: 'details', id: project.id }
    });

    onAddToast("Capital Verified", 'success');
  };

  const denyCapital = (id: string) => {
    const anchor = project.pendingAnchors.find(a => a.id === id);
    if (!anchor) return;

    const updatedProject = {
      ...project,
      pendingAnchors: project.pendingAnchors.map(a => a.id === id ? { ...a, status: 'REJECTED' as const } : a),
      auditHistory: [
        ...project.auditHistory,
        {
          id: `aud-${Date.now()}`,
          action: 'CAPITAL_ANCHOR_REJECTED' as const,
          timestamp: new Date().toISOString(),
          userId: currentUser!.id,
          details: `Rejected ₹${anchor.amount.toLocaleString('en-IN')} capital from ${anchor.userName}`
        }
      ]
    };
    onUpdateProject(updatedProject);

    // Notify the contributor
    onAddNotification(anchor.userId, {
      type: 'FUNDING',
      title: 'Capital Rejected',
      message: `Your ₹${anchor.amount.toLocaleString('en-IN')} contribution to "${project.title}" was not approved.`,
      link: { view: 'details', id: project.id }
    });

    onAddToast("Capital anchor rejected", 'info');
  };

  const submitSkillApp = () => {
    if (!currentUser) { onRequestAuth(UserRole.SKILL_CONTRIBUTOR); return; }
    if (!skillForm.tasks) { onAddToast("Define contribution nodes.", 'error'); return; }
    const appId = `sc-${Date.now()}`;
    const newApp: SkillContribution = {
      id: appId, userId: currentUser.id, userName: currentUser.name, skillCategory: 'Execution',
      specificSkill: skillForm.skill, level: 'Intermediate', contributionType: 'Ongoing', commitment: skillForm.commitment,
      duration: 'Lifecycle', tasks: skillForm.tasks, output: 'Pending', proof: skillForm.portfolio, status: 'PENDING',
      timestamp: new Date().toISOString(), isLearning: false, availability: 'Medium', preferredCommunication: 'Internal Spine'
    };
    onUpdateProject({ ...project, skillContributors: [newApp, ...project.skillContributors] });
    onAddNotification(project.creatorId, {
      type: 'SKILL_APPLICATION',
      title: 'New Specialist Application',
      message: `${currentUser.name} applied for ${skillForm.skill}. Review in Registry.`,
      link: { view: 'details', id: project.id, itemId: appId },
      applicantId: currentUser.id
    });
    setShowSkillModal(false);
    onAddToast("Application Transmitted", 'success');
  };

  const submitCapitalAnchor = () => {
    if (!currentUser) { onRequestAuth(UserRole.CONTRIBUTOR); return; }
    if (!upiRefId) { onAddToast("Ref ID Required", 'error'); return; }
    const anchorId = `anch-${Date.now()}`;
    const newAnchor: PendingAnchor = { id: anchorId, userId: currentUser.id, userName: currentUser.name, amount: parseFloat(capitalAmount), timestamp: new Date().toISOString(), upiRefId, status: 'PENDING' };
    onUpdateProject({ ...project, pendingAnchors: [...project.pendingAnchors, newAnchor] });
    onAddNotification(project.creatorId, {
      type: 'FUNDING',
      title: 'New Capital Addition',
      message: `${currentUser.name} added ₹${Number(capitalAmount).toLocaleString('en-IN')}. Ref: ${upiRefId}.`,
      link: { view: 'details', id: project.id, itemId: anchorId },
      applicantId: currentUser.id
    });
    setCapitalStep('SUCCESS');
  };

  const blueprints = useMemo(() => {
    switch (project.projectType) {
      case ProjectType.RESEARCH_ACADEMIC: return { stack: 'Research Protocol', methodology: 'Data Strategy', equipment: 'Lab Infrastructure', icon: <Microscope className="w-5 h-5" /> };
      case ProjectType.CREATIVE: return { stack: 'Artistic Medium', methodology: 'Creative Direction', equipment: 'Production Gear', icon: <Zap className="w-5 h-5" /> };
      case ProjectType.SOCIAL_IMPACT: return { stack: 'Impact Metrics', methodology: 'Stakeholder Plan', equipment: 'Implementation', icon: <Heart className="w-5 h-5" /> };
      default: return { stack: 'Technical Stack', methodology: 'Execution Logic', equipment: 'Infrastructure', icon: <Cpu className="w-5 h-5" /> };
    }
  }, [project.projectType]);

  const qrCodeImg = useMemo(() => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=20&data=${encodeURIComponent(`upi://pay?pa=${project.upiId}&pn=${encodeURIComponent(project.upiDisplayName || '')}&am=${capitalAmount}`)}`, [project.upiId, project.upiDisplayName, capitalAmount]);

  return (
    <div className="w-full animate-in fade-in duration-1000 px-4 md:px-0 max-w-7xl mx-auto relative text-left">
      
      {/* 🔝 NAV HUB */}
      <div className="sticky top-[72px] z-[80] glass-ui border-b border-slate-200/60 -mx-4 md:-mx-8 px-4 md:px-8 py-5 mb-12 shadow-sm transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 w-full">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <button onClick={onBack} className="p-3 text-slate-400 hover:text-ink hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-200"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex flex-col min-w-0">
               <div className="flex items-center gap-3">
                 <h2 className="text-xl md:text-2xl font-black text-ink uppercase tracking-tighter truncate leading-none">{project.title}</h2>
                 <div className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{project.status}</div>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                 Registry Lead: <span className="text-cobalt font-bold underline decoration-cobalt/30 underline-offset-2">{project.creatorName}</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300" />
                 <span className="font-mono text-slate-300">ID: {project.id.toUpperCase()}</span>
               </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            {!isClosed && !isFrozen && (
              <div className="flex gap-2 w-full sm:w-auto">
                {isCreator && (
                  <button onClick={() => { setEditForm({...project}); setShowEditModal(true); }} className="flex-1 sm:flex-none px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"><Edit3 className="w-4 h-4" /> Edit</button>
                )}
                <button onClick={() => setShowCapitalModal(true)} className="flex-1 sm:flex-none px-6 py-3 bg-ink text-white rounded-2xl text-[11px] font-black uppercase hover:bg-cobalt transition-all shadow-lg">Anchor Capital</button>
                <button onClick={() => { setSkillForm({...skillForm, skill: project.skillsNeeded[0]}); setShowSkillModal(true); }} className="flex-1 sm:flex-none px-5 py-3 bg-white border border-slate-200 text-emerald-600 rounded-2xl text-[11px] font-black uppercase hover:border-emerald-400 transition-all flex items-center justify-center gap-2">Join Specialist Spine</button>
              </div>
            )}
            <button onClick={handleShare} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-ink transition-all shadow-sm"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-[180px]">
           <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] text-center space-y-6 shadow-sm">
              <div className="relative inline-block" onClick={() => onViewProfile(project.creatorId)}>
                 <div className="p-1.5 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.creatorId}`} className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] mx-auto cursor-pointer" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-cobalt rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl"><ShieldCheck className="w-5 h-5" /></div>
              </div>
              <div className="space-y-1.5">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lead Architect</p>
                 <h3 className="text-xl font-black text-ink uppercase tracking-tight leading-none">{project.creatorName}</h3>
              </div>
           </div>

           <div className="p-10 bg-slate-950 text-white rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[70px] opacity-30 group-hover:scale-150 transition-transform duration-1000" />
              <div className="space-y-6 relative z-10 text-left">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Lifecycle Capital</p>
                    <p className="text-5xl font-black tracking-tighter leading-none">₹{project.fundingRaised.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-tighter">/ ₹{project.fundingGoal.toLocaleString('en-IN')} Node Goal</p>
                 </div>
                 <div className="space-y-3">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full shadow-lg transition-all duration-1000" style={{ width: `${fundingProgress}%` }} /></div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500"><span>{Math.round(fundingProgress)}% Pulse</span><span>Verified</span></div>
                 </div>
              </div>
           </div>
        </aside>

        <main className="lg:col-span-9 space-y-20">
          <div className="space-y-8 text-left">
            <div className="space-y-4">
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-ink uppercase">{project.title}</h1>
               <p className="text-2xl md:text-4xl font-serif italic text-slate-400 leading-tight max-w-4xl">"{project.oneLineSummary}"</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-5 py-2.5 bg-ink text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl">{project.category}</span>
              <span className="px-5 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 flex items-center gap-2">{blueprints.icon} {project.projectType.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="sticky top-[162px] z-[70] py-4 border-b border-slate-200/40 bg-surface/80 backdrop-blur-2xl flex flex-wrap gap-1.5 transition-all">
            {['overview', 'integrity', 'roadmap', 'updates', 'finances', 'registry', 'inquiry'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-[0.15em] uppercase border ${activeTab === tab ? 'text-white bg-ink border-ink shadow-lg' : 'text-slate-400 border-transparent hover:text-ink hover:bg-slate-100'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>

          <div className="min-h-[600px] pb-32 text-left">
            {activeTab === 'overview' && (
              <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <section className="space-y-10">
                  <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-6">Challenge Baseline <div className="flex-1 h-px bg-slate-100" /></h3>
                  <div className="relative pl-12"><div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cobalt/10 rounded-full" /><p className="text-3xl md:text-4xl text-slate-600 leading-snug font-medium italic">"{project.problem}"</p></div>
                </section>

                <section className="space-y-10">
                   <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-6">Registry Blueprint <div className="flex-1 h-px bg-slate-100" /></h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-12 bg-white border border-slate-100 rounded-[3rem] space-y-10 shadow-sm">
                         <div className="space-y-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{blueprints.stack}</p><div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm text-slate-600">{project.stack || 'Baseline Execution'}</div></div>
                         <div className="space-y-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{blueprints.methodology}</p><p className="text-lg font-medium text-slate-500 italic">"{project.methodology || 'Standard methodology anchored.'}"</p></div>
                      </div>
                      <div className="p-12 bg-white border border-slate-100 rounded-[3rem] space-y-10 shadow-sm">
                         <div className="space-y-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{blueprints.equipment}</p><div className="flex items-center gap-4 p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl"><div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5" /></div><p className="text-lg font-black text-ink uppercase">{project.equipment || 'Standard Nodes'}</p></div></div>
                      </div>
                   </div>
                </section>

                {/* 🔗 RESOURCE ANCHORS */}
                <section className="space-y-10">
                   <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-6">Resource Anchors <div className="flex-1 h-px bg-slate-100" /></h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {project.projectLinks.map(link => (
                         <a key={link.id} href={link.url} target="_blank" className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all flex flex-col items-center text-center group">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-cobalt group-hover:bg-indigo-50 transition-all mb-4 border border-slate-50 shadow-inner">
                               {link.type === 'image' ? <ImageIcon className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{link.type} Node</p>
                            <h4 className="font-black text-ink uppercase text-sm tracking-tight group-hover:text-cobalt transition-colors">{link.label}</h4>
                         </a>
                      ))}
                      {project.projectLinks.length === 0 && <div className="col-span-full py-16 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] text-[10px] font-black text-slate-300 uppercase tracking-widest">No external resources anchored.</div>}
                   </div>
                </section>

                {/* 🎁 INCENTIVES SECTION */}
                <section className="space-y-10">
                   <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-6">Participation Incentives <div className="flex-1 h-px bg-slate-100" /></h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {project.incentives.map(inc => (
                         <div key={inc.id} className="p-10 bg-white border border-indigo-50 rounded-[3rem] shadow-sm space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-4 relative z-10">
                               <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200"><Gift className="w-6 h-6" /></div>
                               <div className="space-y-0.5">
                                  <h4 className="text-xl font-black text-ink uppercase tracking-tight">{inc.title}</h4>
                                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{inc.type} • Eligible: {inc.eligible}</span>
                               </div>
                            </div>
                            <p className="text-lg text-slate-500 font-medium italic relative z-10 leading-relaxed">"{inc.description}"</p>
                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center relative z-10">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timing: {inc.deliveryTiming}</span>
                               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${inc.status === 'Unlocked' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{inc.status}</span>
                            </div>
                         </div>
                      ))}
                      {project.incentives.length === 0 && <div className="col-span-full py-16 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] text-[10px] font-black text-slate-300 uppercase tracking-widest">No incentives defined for this architecture.</div>}
                   </div>
                </section>
              </div>
            )}

            {/* INTEGRITY TAB */}
            {activeTab === 'integrity' && (
              <div className="space-y-20 animate-in fade-in duration-700 text-left">
                <div className="space-y-3"><h3 className="text-4xl font-black text-ink uppercase tracking-tight">System Integrity Audit</h3><p className="text-lg text-slate-400 font-medium italic">Metrics derived from immutable pulses.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-12 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10"><div className="flex items-center gap-4 text-cobalt"><div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center"><Activity className="w-6 h-6" /></div><h4 className="text-xl font-black uppercase">Health Status</h4></div><span className={`text-2xl font-black uppercase ${integrityMetrics.healthColor}`}>{integrityMetrics.healthStatus}</span></div>
                    <div className="space-y-6"><div className="space-y-3"><div className="flex justify-between items-end"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocity Node</span><span className="text-lg font-black">{Math.round(integrityMetrics.milestoneProgressRatio)}%</span></div><div className="h-2 bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-cobalt transition-all duration-1000" style={{ width: `${integrityMetrics.milestoneProgressRatio}%` }} /></div></div></div>
                  </div>
                  <div className="p-12 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm group">
                    <div className="flex items-center justify-between mb-10"><div className="flex items-center gap-4 text-amber-500"><div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center"><Scale className="w-6 h-6" /></div><h4 className="text-xl font-black uppercase">Transparency</h4></div><span className="text-2xl font-black text-ink uppercase">{integrityMetrics.stabilityClass}</span></div>
                    <div className="space-y-6"><div className="space-y-3"><div className="flex justify-between items-end"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blocker Report Logic</span><span className="text-lg font-black">{integrityMetrics.transparencyLabel}</span></div><div className="h-2 bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${integrityMetrics.transparencyRatio}%` }} /></div></div></div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY/PULSES TAB */}
            {activeTab === 'updates' && (
              <div className="space-y-20 animate-in fade-in text-left">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-10">
                  <div className="space-y-3"><h3 className="text-4xl font-black text-ink uppercase tracking-tight">Activity Spine</h3><p className="text-lg text-slate-400 font-medium italic">Immutable history of project execution pulses.</p></div>
                  {isCreator && canModify && (<button onClick={openNewPulseModal} className="px-8 py-4 bg-ink text-white rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest hover:bg-cobalt shadow-xl transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Record Pulse</button>)}
                </div>
                <div className="relative space-y-12 pl-8 md:pl-20">
                  <div className="absolute left-[34px] md:left-[45px] top-0 bottom-0 w-1 bg-slate-100 rounded-full" />
                  {project.updates.map((u, i) => (
                    <div key={u.id} className="relative group">
                       <div className="absolute -left-[42px] md:-left-[58px] top-8 w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-white border-4 border-cobalt flex items-center justify-center shadow-lg z-10 transition-transform group-hover:scale-110"><Activity className="w-4 h-4 text-cobalt" /></div>
                       <div className="p-10 md:p-12 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all space-y-10">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(u.timestamp).toLocaleDateString()} Pulse</p>
                                <h4 className="text-2xl font-black text-ink uppercase tracking-tight">{u.summary}</h4>
                             </div>
                             <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">#{u.id.substring(0,10).toUpperCase()}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-50">
                             <div className="space-y-6">
                                <div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Update</p><p className="text-lg text-slate-600 font-medium leading-relaxed italic">"{u.done}"</p></div>
                             </div>
                             <div className="space-y-6">
                                {u.blocked && (<div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 items-start"><AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" /><div className="space-y-1"><p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Stalled Nodes</p><p className="text-xs font-bold text-rose-700 italic">"{u.blocked}"</p></div></div>)}
                                <div className="space-y-3">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traceable Evidence</p>
                                   <div className="flex flex-wrap gap-2">
                                      {u.evidence.map((ev, i) => (<a key={i} href={ev} target="_blank" className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-cobalt hover:bg-white transition-all"><ExternalLinkIcon className="w-3.5 h-3.5" /> View Node Proof</a>))}
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROADMAP TAB */}
            {activeTab === 'roadmap' && (
              <div className="space-y-20 animate-in fade-in duration-700 text-left">
                <div className="space-y-3 border-b border-slate-200/60 pb-10"><h3 className="text-4xl font-black text-ink uppercase tracking-tight">Lifecycle Roadmap</h3><p className="text-lg text-slate-400 font-medium italic">Defined execution phases with specific anchors.</p></div>
                <div className="space-y-12 pl-12 border-l border-slate-100">
                  {project.milestones.map((m, idx) => (
                    <div key={m.id} className="relative group">
                       <div className={`absolute -left-[54px] top-10 w-4 h-4 rounded-full border-4 border-white shadow-xl ${m.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                       <div className="p-12 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all space-y-8">
                          <div className="flex justify-between items-start"><div className="space-y-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phase 0{idx + 1}</p><h4 className="text-3xl font-black text-ink uppercase">{m.title}</h4></div><span className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[10px] font-bold text-slate-400 uppercase">{m.timeWindow} Window</span></div>
                          <p className="text-xl text-slate-500 font-medium italic leading-relaxed">"{m.description}"</p>
                          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6"><div className="space-y-1.5"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verifiable Deliverable</p><p className="text-lg font-black text-ink">{m.deliverable}</p></div><div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 ${m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{m.status}</div></div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FINANCES TAB */}
            {activeTab === 'finances' && (
              <div className="space-y-20 animate-in fade-in duration-700 text-left">
                 <div className="space-y-3 border-b border-slate-200/60 pb-10"><h3 className="text-4xl font-black text-ink uppercase tracking-tight">Financial Ledger Spine</h3><p className="text-lg text-slate-400 font-medium italic">Transparency record of all capital node allocations.</p></div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
                       {project.financialBreakdown.map(item => (
                          <div key={item.id} className="p-10 bg-white border border-slate-100 rounded-[3rem] space-y-6 hover:shadow-lg transition-all group">
                             <div className="flex justify-between items-start">
                                <div className="space-y-1"><h5 className="text-2xl font-black text-ink uppercase tracking-tight">{item.item}</h5><span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block ${item.status === 'SPENT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{item.status}</span></div>
                                <span className="text-3xl font-black text-ink tracking-tighter">₹{Number(item.amount).toLocaleString('en-IN')}</span>
                             </div>
                             <p className="text-base text-slate-500 font-medium italic leading-relaxed">"{item.description}"</p>
                          </div>
                       ))}
                    </div>
                    <div className="p-12 bg-slate-950 text-white rounded-[3.5rem] space-y-12 shadow-3xl lg:sticky lg:top-[220px]">
                       <div className="space-y-3"><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Lifecycle Funding</p><h4 className="text-7xl font-black tracking-tighter leading-none">₹{project.fundingGoal.toLocaleString('en-IN')}</h4></div>
                       <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
                          <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Anchored</p><p className="text-3xl font-black text-indigo-400 tracking-tighter">₹{project.fundingRaised.toLocaleString('en-IN')}</p></div>
                          <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Gap Node</p><p className="text-3xl font-black text-rose-500 tracking-tighter">₹{(project.fundingGoal - project.fundingRaised).toLocaleString('en-IN')}</p></div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* REGISTRY TAB - SPECIALIST SPINE */}
            {activeTab === 'registry' && (
              <div className="space-y-20 animate-in fade-in duration-700 text-left">
                 <div className="space-y-3 border-b border-slate-200/60 pb-10">
                    <h3 className="text-4xl font-black text-ink uppercase tracking-tight">Lifecycle Specialist Registry</h3>
                    <p className="text-lg text-slate-400 font-medium italic">Expert nodes currently anchored in the execution spine.</p>
                 </div>

                 <section className="space-y-10">
                    <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-6">Specialist Spine <div className="flex-1 h-px bg-slate-100" /></h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       <div className="p-10 bg-slate-950 text-white rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group border border-white/5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[70px] opacity-20" />
                          <div className="flex items-center gap-5 relative z-10"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.creatorId}`} className="w-16 h-16 rounded-2xl bg-white/10 p-1 border border-white/10" /><div className="min-w-0"><p className="text-xl font-black tracking-tight truncate">{project.creatorName}</p><p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Lead Architect Node</p></div></div>
                          <div className="pt-8 border-t border-white/10 flex justify-between items-center relative z-10"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rep Score</span><span className="text-2xl font-black">{project.reputationScore}</span></div>
                       </div>

                       {/* Group approved contributors under their respective skills */}
                       {project.skillsNeeded.map(skill => {
                          const specialists = project.skillContributors.filter(sc => sc.specificSkill === skill && sc.status === 'APPROVED');
                          
                          if (specialists.length > 0) {
                             return specialists.map(sc => (
                               <div key={sc.id} onClick={() => onViewProfile(sc.userId)} className="p-10 bg-white border-2 border-indigo-100 rounded-[3rem] space-y-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
                                  <div className="flex items-center gap-5">
                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sc.userId}`} className="w-16 h-16 rounded-2xl bg-slate-50 p-1 border border-slate-100 shadow-sm" />
                                     <div className="min-w-0">
                                       <p className="text-xl font-black text-ink tracking-tight truncate group-hover:text-cobalt transition-colors">{sc.userName}</p>
                                       <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{skill} Specialist</p>
                                     </div>
                                  </div>
                                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-medium text-slate-500 italic leading-relaxed">
                                     "{sc.tasks}"
                                  </div>
                                  <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase text-slate-400">Node Verified</span>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                  </div>
                               </div>
                             ));
                          }

                          return (
                            <div key={skill} className="p-10 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center space-y-6 bg-slate-50/20 group hover:bg-white hover:border-indigo-300 transition-all text-center">
                               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 group-hover:text-indigo-600 transition-colors shadow-sm"><Layers className="w-6 h-6" /></div>
                               <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Specialist Demand</p><p className="text-xl font-black text-ink uppercase tracking-tight">{skill}</p></div>
                               {canModify && (<button onClick={() => { setSkillForm({...skillForm, skill}); setShowSkillModal(true); }} className="px-8 py-3 bg-white border border-slate-200 text-ink text-[10px] font-black uppercase rounded-2xl hover:bg-ink hover:text-white transition-all shadow-sm">Join Architecture</button>)}
                            </div>
                          );
                       })}
                    </div>
                 </section>

                 {(isCreator || isGlobalAdmin) && canModify && (
                   <section className="space-y-10 pt-10 border-t border-slate-100">
                      <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] flex items-center gap-6">Verification Hub <div className="flex-1 h-px bg-slate-100" /></h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Users className="w-4 h-4" /> Pending Applications</h5>
                            <div className="space-y-4">
                               {project.skillContributors.filter(sc => sc.status === 'PENDING').map(sc => (
                                 <div key={sc.id} className="p-6 bg-white border border-indigo-100/50 rounded-3xl flex justify-between items-center shadow-sm">
                                    <div className="min-w-0"><p className="text-sm font-black text-ink truncate">{sc.userName}</p><p className="text-[9px] font-black text-indigo-400 uppercase truncate">{sc.specificSkill}</p></div>
                                    <div className="flex gap-2 shrink-0">
                                      <button onClick={() => approveSpecialist(sc.id)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"><Check className="w-4 h-4" /></button>
                                      <button onClick={() => denySpecialist(sc.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                 </div>
                               ))}
                               {project.skillContributors.filter(sc => sc.status === 'PENDING').length === 0 && <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest py-4">No pending applications</p>}
                            </div>
                         </div>
                         <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><DollarSign className="w-4 h-4" /> Capital Verification</h5>
                            <div className="space-y-4">
                               {project.pendingAnchors.filter(a => a.status === 'PENDING').map(a => (
                                 <div key={a.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-sm">
                                    <div className="min-w-0"><p className="text-sm font-black text-ink truncate">{a.userName} <span className="text-cobalt ml-2">₹{a.amount.toLocaleString('en-IN')}</span></p><p className="text-[9px] font-mono text-slate-300 truncate">#REF: {a.upiRefId}</p></div>
                                    <div className="flex gap-2 shrink-0">
                                      <button onClick={() => approveCapital(a.id)} className="px-5 py-2.5 bg-ink text-white text-[10px] font-black uppercase rounded-xl hover:bg-cobalt transition-all shadow-lg shrink-0">Verify</button>
                                      <button onClick={() => denyCapital(a.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                 </div>
                               ))}
                               {project.pendingAnchors.filter(a => a.status === 'PENDING').length === 0 && <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest py-4">No pending capital</p>}
                            </div>
                         </div>
                      </div>
                   </section>
                 )}
              </div>
            )}

            {/* INQUIRY TAB */}
            {activeTab === 'inquiry' && (
              <div className="space-y-20 animate-in fade-in duration-700 text-left">
                 {canModify && (<div className="p-12 bg-white border border-slate-100 rounded-[4rem] space-y-12 shadow-sm relative overflow-hidden group"><div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-50 rounded-full blur-[60px] opacity-40 group-hover:scale-150 transition-transform duration-1000" /><div className="flex items-center gap-5 text-cobalt relative z-10"><MessageSquare className="w-8 h-8" /><h4 className="text-3xl font-black uppercase tracking-tight">Lifecycle Inquiry</h4></div><textarea className="w-full p-10 bg-slate-50 border border-slate-100 rounded-[3rem] outline-none focus:ring-8 focus:ring-indigo-50/50 font-medium min-h-[220px] text-xl italic transition-all relative z-10 shadow-inner" placeholder="Transmit a query to the architect..." value={questionText} onChange={e => setQuestionText(e.target.value)} /><div className="flex justify-end relative z-10"><button onClick={postQuestion} className="px-12 py-6 bg-ink text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-cobalt shadow-2xl">Transmit Inquiry</button></div></div>)}
                 <div className="space-y-16">
                    {project.qa.map((qa, i) => (
                       <div key={qa.id} className="space-y-8 animate-in slide-in-from-left-4 fade-in" style={{ animationDelay: `${i * 100}ms` }}><div className="flex gap-8 items-start"><div className="p-1 bg-slate-50 rounded-[1.8rem] border border-slate-100 shrink-0 shadow-sm"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${qa.userId}`} className="w-16 h-16 rounded-[1.5rem]" /></div><div className="flex-1 space-y-4"><div className="flex items-center gap-4"><span className="text-[11px] font-black text-ink uppercase tracking-[0.2em]">{qa.userName}</span><span className="text-[10px] font-mono text-slate-300 font-bold">{new Date(qa.timestamp).toLocaleString()} Pulse</span></div><p className="text-xl md:text-2xl font-medium text-slate-600 bg-white border border-slate-100 p-12 rounded-[3.5rem] italic shadow-sm relative group">"{qa.question}"<span className="absolute -top-4 -left-4 text-indigo-100 opacity-30 group-hover:opacity-60 transition-opacity"><Quote className="w-12 h-12 -rotate-180" /></span></p></div></div>{qa.answer ? (<div className="flex gap-8 items-start ml-12 md:ml-32 border-l-2 border-indigo-100 pl-12 md:pl-20 pt-6"><div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-xl"><Shield className="w-7 h-7" /></div><div className="flex-1 space-y-3"><p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Verified Response</p><p className="text-xl md:text-2xl font-bold text-ink leading-relaxed">"{qa.answer}"</p></div></div>) : isCreator && canModify && (<div className="ml-12 md:ml-32 border-l-2 border-slate-100 pl-12 md:pl-20 pt-6 space-y-6"><textarea className="w-full p-8 bg-white border border-slate-100 rounded-[2rem] outline-none focus:ring-8 focus:ring-indigo-50/50 transition-all font-medium italic shadow-sm" placeholder="Anchor response..." value={answerTexts[qa.id] || ''} onChange={e => setAnswerTexts({...answerTexts, [qa.id]: e.target.value})} /><div className="flex justify-end"><button onClick={() => postAnswer(qa.id)} className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase shadow-xl">Record Pulse</button></div></div>)}</div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {showPulseModal && (
        <div className="fixed inset-0 z-[200] bg-ink/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-3xl rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-100 relative text-left max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowPulseModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-ink"><X className="w-8 h-8" /></button>
              <div className="space-y-16">
                 <div className="space-y-3"><p className="text-[10px] font-black text-cobalt uppercase tracking-[0.4em]">{editingPulseId ? "Revised Node Pulse" : "Anchor New Pulse"}</p><h3 className="text-4xl font-black text-ink uppercase tracking-tight leading-none">{editingPulseId ? "Update Pulse Record" : "Record Progress Node"}</h3></div>
                 <div className="space-y-10">
                    <div className="space-y-4"><label className="text-[11px] uppercase font-black text-slate-400 tracking-widest">Summary Anchor</label><input className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-2xl outline-none" value={pulseForm.summary} onChange={e => setPulseForm({...pulseForm, summary: e.target.value})} /></div>
                    <textarea className="w-full px-10 py-8 bg-slate-50 border border-slate-100 rounded-[3rem] font-medium h-48 outline-none text-lg leading-relaxed shadow-inner" value={pulseForm.done} onChange={e => setPulseForm({...pulseForm, done: e.target.value})} placeholder="Logs..." />
                 </div>
                 <div className="pt-12 border-t border-slate-100 flex justify-end gap-6">
                    <button 
                      type="button"
                      onClick={() => setShowPulseModal(false)} 
                      className="px-10 py-6 text-slate-400 font-black uppercase text-[11px]"
                    >
                      Discard
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSavePulse();
                      }} 
                      className="px-14 py-6 bg-ink text-white rounded-[2rem] font-black uppercase text-[12px] shadow-2xl"
                    >
                      Anchor Pulse
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-[200] bg-ink/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-4xl rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-100 relative text-left max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowEditModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-ink"><X className="w-8 h-8" /></button>
              <div className="space-y-16">
                 <h3 className="text-4xl font-black text-ink uppercase tracking-tight">Full Registry Revision</h3>
                 <div className="space-y-10">
                    <div className="space-y-4"><label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-2">Title Anchor</label><input className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-2xl outline-none" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Problem Node</label><textarea className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none" value={editForm.problem} onChange={e => setEditForm({...editForm, problem: e.target.value})} /></div>
                      <div className="space-y-4"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Solution Architecture</label><textarea className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none" value={editForm.solution} onChange={e => setEditForm({...editForm, solution: e.target.value})} /></div>
                    </div>
                 </div>
                 <div className="pt-12 border-t border-slate-100 flex justify-end gap-6"><button onClick={() => setShowEditModal(false)} className="px-10 py-6 text-slate-400 font-black uppercase text-[11px]">Discard</button><button onClick={handleSaveEdit} className="px-16 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[12px] shadow-2xl">Save Revision Pulse</button></div>
              </div>
           </div>
        </div>
      )}

      {/* SPECIALIST SPINE MODAL */}
      {showSkillModal && (
        <div className="fixed inset-0 z-[200] bg-ink/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-100 relative text-left">
              <button onClick={() => setShowSkillModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-ink"><X className="w-8 h-8" /></button>
              <div className="space-y-12">
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Specialist Application</p>
                    <h3 className="text-4xl font-black text-ink uppercase tracking-tight leading-none">Join specialist spine</h3>
                    <p className="text-lg text-slate-400 font-medium italic">Commit your expert nodes to this architecture lifecycle.</p>
                 </div>
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-2">Applying for Role</label>
                       <select className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black uppercase text-xs outline-none" value={skillForm.skill} onChange={e => setSkillForm({...skillForm, skill: e.target.value})}>
                          {project.skillsNeeded.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-2">Portfolio/Proof Link</label>
                        <input className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs outline-none" value={skillForm.portfolio} onChange={e => setSkillForm({...skillForm, portfolio: e.target.value})} placeholder="https://portfolio.com" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-2">Commitment (Time/Week)</label>
                        <input className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" value={skillForm.commitment} onChange={e => setSkillForm({...skillForm, commitment: e.target.value})} placeholder="e.g. 15h / week" />
                      </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-2">Planned contribution nodes (Actions)</label>
                       <textarea className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium h-32 outline-none" value={skillForm.tasks} onChange={e => setSkillForm({...skillForm, tasks: e.target.value})} placeholder="Describe your planned sequence of execution actions..." />
                    </div>
                    <button onClick={submitSkillApp} className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-emerald-100 hover:bg-ink transition-all">Transmit specialist application</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showCapitalModal && (
        <div className="fixed inset-0 z-[200] bg-ink/60 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-100 relative text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-60" /><button onClick={() => setShowCapitalModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-ink z-20"><X className="w-8 h-8" /></button>
              <div className="space-y-16 relative z-10">
                 <h3 className="text-4xl font-black text-ink uppercase leading-none">Anchor Capital Pulse</h3>
                 {capitalStep === 'AMOUNT' && (<div className="space-y-10 animate-in slide-in-from-bottom-4"><div className="space-y-4"><label className="text-[11px] uppercase font-black text-slate-400 tracking-widest">Pulse Volume (₹)</label><input type="number" className="w-full px-12 py-10 bg-slate-50 border border-slate-100 rounded-[3rem] text-7xl font-black outline-none tracking-tighter" value={capitalAmount} onChange={e => setCapitalAmount(e.target.value)} /></div><button onClick={() => setCapitalStep('QR')} className="w-full py-8 bg-ink text-white rounded-[2.5rem] font-black uppercase text-[14px] shadow-3xl hover:bg-cobalt transition-all">Generate Pulse QR</button></div>)}
                 {capitalStep === 'QR' && (<div className="space-y-10 text-center animate-in slide-in-from-bottom-4"><div className="p-6 bg-white border-2 border-slate-50 rounded-[3rem] inline-block shadow-inner mx-auto"><img src={qrCodeImg} alt="QR" className="w-64 h-64 rounded-2xl" /></div><p className="text-sm text-slate-400 font-bold uppercase">Awaiting Verification...</p><button onClick={() => setCapitalStep('CONFIRM')} className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] shadow-2xl">I Have Paid</button></div>)}
                 {capitalStep === 'CONFIRM' && (<div className="space-y-10 animate-in slide-in-from-bottom-4"><div className="space-y-4"><label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-2">Transaction Ref</label><input type="text" className="w-full px-10 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-black outline-none text-xl" placeholder="12-digit Ref ID..." value={upiRefId} onChange={e => setUpiRefId(e.target.value)} /></div><button onClick={submitCapitalAnchor} className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] shadow-2xl">Submit Pulse Anchor</button></div>)}
                 {capitalStep === 'SUCCESS' && (<div className="space-y-12 text-center py-12 animate-in zoom-in-95"><div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 className="w-12 h-12" /></div><div className="space-y-4"><h4 className="text-4xl font-black text-ink uppercase">Pulse Transmitted</h4><p className="text-lg text-slate-500 font-medium italic">Architect will verify shortly.</p></div><button onClick={() => setShowCapitalModal(false)} className="px-16 py-6 bg-ink text-white rounded-[2rem] text-[12px] font-black uppercase shadow-2xl">Done</button></div>)}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;