
import React, { useState } from 'react';
import { Project, ProjectStatus, Milestone, User, ProjectType, AuditLog, ParticipationIncentive, ExternalLink, FinancialNode, UpdateFrequency } from '../types';
import { Target, Plus, ChevronRight, ShieldCheck, Activity, X, Users, DollarSign, Gift, Cpu, Microscope, Heart, Lightbulb, Zap, Shield, Trash2, Calendar, Link as LinkIcon, Image as ImageIcon, Mail, Terminal, Award, BookOpen, Layers, Coins } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface CreateProjectProps {
  onCancel: () => void;
  onSuccess: (project: Project) => void;
  creator: User;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onCancel, onSuccess, creator }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    oneLineSummary: '',
    problem: '',
    solution: '',
    projectType: ProjectType.TECH_PRODUCT,
    stack: '',
    methodology: '',
    equipment: '',
    upiId: creator.upiId || '',
    upiDisplayName: creator.name || '',
    skillsNeeded: [] as string[],
    newSkill: '',
    updateFrequency: 'WEEKLY' as UpdateFrequency,
    contactEmail: creator.email,
    duration: '6 Months',
  });

  const [milestones, setMilestones] = useState<Partial<Milestone>[]>([
    { id: 'm-1', title: 'Phase One: Core Logic', description: 'Establishing the foundational execution node.', goal: 'Operational Baseline', deliverable: 'Technical/Research Roadmap', timeWindow: '4 weeks', status: 'ACTIVE' }
  ]);

  const [ledger, setLedger] = useState<FinancialNode[]>([
    { id: 'f-1', item: 'Infrastructure Setup', amount: 5000, description: 'Core operational nodes and hosting.', status: 'ESTIMATED' }
  ]);

  const [projectResources, setProjectResources] = useState<ExternalLink[]>([
    { id: 'r-1', label: 'Reference Documentation', url: '', type: 'link' }
  ]);

  const [incentives, setIncentives] = useState<ParticipationIncentive[]>([
    { id: 'i-1', type: 'Public Credit', title: 'Founding Node Recognition', description: 'Acknowledgment in the project registry spine.', eligible: 'Both', deliveryTiming: 'After Project', status: 'Upcoming' }
  ]);

  const getBlueprintLabels = () => {
    switch (formData.projectType) {
      case ProjectType.RESEARCH_ACADEMIC:
        return { stack: 'Research Protocol', methodology: 'Data Analysis Strategy', equipment: 'Lab / Data Infrastructure' };
      case ProjectType.CREATIVE:
        return { stack: 'Artistic Medium / Tools', methodology: 'Creative Direction', equipment: 'Production Equipment' };
      case ProjectType.SOCIAL_IMPACT:
        return { stack: 'Impact Metrics', methodology: 'Stakeholder Strategy', equipment: 'Implementation Resources' };
      case ProjectType.LEARNING_EXPERIMENT:
        return { stack: 'Hypothesis / Goals', methodology: 'Experiment Design', equipment: 'Learning Resources' };
      default:
        return { stack: 'Technical Stack', methodology: 'System Methodology', equipment: 'Hardware / Infrastructure' };
    }
  };

  const labels = getBlueprintLabels();

  const addResource = (type: 'link' | 'image') => {
    setProjectResources([...projectResources, { id: `r-${Date.now()}`, label: '', url: '', type }]);
  };

  const updateResource = (id: string, field: keyof ExternalLink, value: any) => {
    setProjectResources(projectResources.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addIncentive = () => {
    setIncentives([...incentives, { id: `i-${Date.now()}`, type: 'Access', title: '', description: '', eligible: 'Both', deliveryTiming: 'After Project', status: 'Upcoming' }]);
  };

  const updateIncentive = (id: string, field: keyof ParticipationIncentive, value: any) => {
    setIncentives(incentives.map(inc => inc.id === id ? { ...inc, [field]: value } : inc));
  };

  const addLedgerItem = () => {
    setLedger([...ledger, { id: `f-${Date.now()}`, item: '', amount: 0, description: '', status: 'ESTIMATED' }]);
  };

  const updateLedgerItem = (id: string, field: keyof FinancialNode, value: any) => {
    setLedger(ledger.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addMilestone = () => {
    setMilestones([...milestones, { id: `m-${Date.now()}`, title: '', description: '', goal: '', deliverable: '', timeWindow: '', status: 'PENDING' }]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addSkill = () => {
    if (formData.newSkill && !formData.skillsNeeded.includes(formData.newSkill)) {
      setFormData({ ...formData, skillsNeeded: [...formData.skillsNeeded, formData.newSkill], newSkill: '' });
    }
  };

  const calculateTotalFunding = () => ledger.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSubmit = () => {
    const finalProject: Project = {
      ...formData,
      id: `p-${Date.now()}`,
      creatorId: creator.id,
      creatorName: creator.name,
      fundingGoal: calculateTotalFunding(),
      fundingRaised: 0,
      backerIds: [], 
      pendingAnchors: [],
      financialBreakdown: ledger,
      projectLinks: projectResources.filter(r => r.url),
      status: ProjectStatus.ACTIVE,
      reputationScore: creator.reputation,
      lastUpdate: new Date().toISOString(),
      milestones: milestones as Milestone[],
      updates: [],
      skillContributors: [],
      qa: [],
      auditHistory: [{
        id: `au-${Date.now()}`,
        action: 'PROJECT_START',
        timestamp: new Date().toISOString(),
        userId: creator.id,
        details: "Project lifecycle initialized with dynamic execution node."
      }],
      incentives: incentives,
      hasIncentives: incentives.length > 0
    };
    onSuccess(finalProject);
  };

  const TOTAL_STEPS = 11;

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 mb-20 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Initialize Node</h1>
          <p className="text-slate-500 font-medium italic">Phase {step} of {TOTAL_STEPS} — Building the Registry Spine</p>
        </div>
        <div className="flex gap-1.5 overflow-hidden">
          {Array.from({length: TOTAL_STEPS}).map((_, i) => {
            const s = i + 1;
            return (
              <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${s <= step ? 'bg-indigo-600 shadow-lg' : 'bg-slate-100'}`} />
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3.5rem] p-8 md:p-16 shadow-2xl shadow-slate-100/30 min-h-[650px]">
        
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight">Identity Node</h2>
              <p className="text-slate-500 font-medium italic">Define the primary identity and the execution path of the lifecycle.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">Primary Title</label>
                <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-xl outline-none focus:ring-8 focus:ring-indigo-50 transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Project Identity Name..." />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">Execution Path</label>
                <select className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-black uppercase tracking-widest text-xs outline-none" value={formData.projectType} onChange={e => setFormData({ ...formData, projectType: e.target.value as any })}>
                  <option value={ProjectType.TECH_PRODUCT}>Technical / Product Node</option>
                  <option value={ProjectType.RESEARCH_ACADEMIC}>Research / Academic Node</option>
                  <option value={ProjectType.CREATIVE}>Creative / Artistic Node</option>
                  <option value={ProjectType.SOCIAL_IMPACT}>Social Impact Node</option>
                  <option value={ProjectType.LEARNING_EXPERIMENT}>Learning Experiment Node</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">Lifecycle Category</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFormData({...formData, category: cat})} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${formData.category === cat ? 'bg-ink text-white border-ink' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-lg outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Or define custom category..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight">Functional Blueprint</h2>
              <p className="text-slate-500 font-medium italic">Blueprints specific to a <span className="text-indigo-600 font-bold uppercase">{formData.projectType.replace('_', ' ')}</span> execution node.</p>
            </div>
            <div className="space-y-8 text-left">
               <div className="space-y-3">
                 <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">{labels.stack}</label>
                 <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-sm outline-none focus:ring-8 focus:ring-indigo-50 transition-all" value={formData.stack} onChange={e => setFormData({ ...formData, stack: e.target.value })} placeholder={`Define ${labels.stack.toLowerCase()}...`} />
               </div>
               <div className="space-y-3">
                 <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">{labels.methodology}</label>
                 <textarea className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-medium outline-none focus:ring-8 focus:ring-indigo-50 transition-all" rows={3} placeholder={`Describe your ${labels.methodology.toLowerCase()}...`} value={formData.methodology} onChange={e => setFormData({ ...formData, methodology: e.target.value })} />
               </div>
               <div className="space-y-3">
                 <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">{labels.equipment}</label>
                 <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-lg outline-none focus:ring-8 focus:ring-indigo-50 transition-all" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value })} placeholder={`List required ${labels.equipment.toLowerCase()}...`} />
               </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight">Intent pulse</h2>
              <p className="text-slate-500 font-medium italic">Establish the challenge node and the proposed system resolution.</p>
            </div>
            <div className="space-y-8">
               <div className="space-y-3">
                 <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">One-Line Summary</label>
                 <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-medium italic text-lg outline-none" value={formData.oneLineSummary} onChange={e => setFormData({ ...formData, oneLineSummary: e.target.value })} placeholder="Capture the mission in 12 words..." />
               </div>
               <div className="space-y-3">
                 <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">The Problem Anchor</label>
                 <textarea className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-medium outline-none" rows={3} placeholder="What specifically is being addressed?" value={formData.problem} onChange={e => setFormData({ ...formData, problem: e.target.value })} />
               </div>
               <div className="space-y-3">
                 <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">The Proposed Solution Architecture</label>
                 <textarea className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-medium outline-none" rows={3} placeholder="Describe the resolution mechanism..." value={formData.solution} onChange={e => setFormData({ ...formData, solution: e.target.value })} />
               </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tight">Temporal params</h2>
                <p className="text-slate-500 font-medium italic">Set the duration and update cadence for the registry spine.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                   <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">Estimated Lifecycle Duration</label>
                   <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-xl outline-none" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 18 Months" />
                </div>
                <div className="space-y-3">
                   <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">Update Pulse Frequency</label>
                   <select className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-black uppercase tracking-widest text-xs outline-none" value={formData.updateFrequency} onChange={e => setFormData({ ...formData, updateFrequency: e.target.value as any })}>
                      <option value="DAILY">Daily Pulse</option>
                      <option value="WEEKLY">Weekly Sync</option>
                      <option value="BI-WEEKLY">Bi-Weekly Sync</option>
                      <option value="MONTHLY">Monthly Audit</option>
                   </select>
                </div>
             </div>
             <div className="space-y-3">
                <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">Direct Contact Anchor (Email)</label>
                <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-lg outline-none" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="architect@registry.spine" />
             </div>
          </div>
        )}

        {step === 5 && (
           <div className="space-y-12 animate-in fade-in duration-500 text-left">
              <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Milestone Spine</h2>
                    <p className="text-slate-500 font-medium italic">Define verifiable nodes with required deliverable anchors.</p>
                 </div>
                 <button onClick={addMilestone} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">+ Add Milestone</button>
              </div>
              <div className="space-y-6 max-h-[450px] overflow-y-auto pr-4">
                 {milestones.map((m, idx) => (
                    <div key={m.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[3rem] space-y-6 relative hover:shadow-xl transition-all">
                       <div className="flex justify-between items-center">
                          <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">Node {idx + 1}</span>
                          <input className="bg-transparent text-right font-mono text-[11px] font-bold text-slate-400 outline-none w-32" value={m.timeWindow} onChange={e => updateMilestone(m.id!, 'timeWindow', e.target.value)} placeholder="Node Duration..." />
                       </div>
                       <input className="w-full bg-transparent border-b border-slate-200 pb-2 font-black text-2xl outline-none focus:border-indigo-600 transition-all" value={m.title} onChange={e => updateMilestone(m.id!, 'title', e.target.value)} placeholder="Milestone Identity..." />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <textarea className="w-full p-6 bg-white border border-slate-100 rounded-3xl text-sm font-medium outline-none h-24" value={m.description} onChange={e => updateMilestone(m.id!, 'description', e.target.value)} placeholder="Define the phase goals..." />
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verifiable Deliverable Anchor</label>
                             <input className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-black outline-none" value={m.deliverable} onChange={e => updateMilestone(m.id!, 'deliverable', e.target.value)} placeholder="Required Output Proof (Link/File)..." />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {step === 6 && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-4">
                 <h2 className="text-3xl font-black uppercase tracking-tight">Specialist Demand Spine</h2>
                 <p className="text-slate-500 font-medium italic">Define the skill nodes required for lifecycle execution.</p>
              </div>
              <div className="flex gap-4">
                 <input placeholder="Add specialist node (e.g. Lead Mycologist)..." className="flex-1 px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none focus:ring-8 focus:ring-indigo-50 transition-all" value={formData.newSkill} onChange={e => setFormData({ ...formData, newSkill: e.target.value })} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                 <button onClick={addSkill} className="px-10 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl">Anchor Demand</button>
              </div>
              <div className="flex flex-wrap gap-4">
                 {formData.skillsNeeded.map(s => <span key={s} className="px-6 py-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">{s} <X className="w-4 h-4 cursor-pointer hover:text-rose-500" onClick={() => setFormData({...formData, skillsNeeded: formData.skillsNeeded.filter(sk => sk !== s)})} /></span>)}
              </div>
           </div>
        )}

        {step === 7 && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex justify-between items-end border-b border-slate-100 pb-8 text-left">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Participation Incentives</h2>
                    <p className="text-slate-500 font-medium italic">Define reward nodes for verified capital and specialist contributors.</p>
                 </div>
                 <button onClick={addIncentive} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">+ Add Incentive</button>
              </div>
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
                 {incentives.map((inc) => (
                    <div key={inc.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[3rem] space-y-6 text-left relative group">
                       <button onClick={() => setIncentives(incentives.filter(i => i.id !== inc.id))} className="absolute top-8 right-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incentive Identity</label>
                             <input className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={inc.title} onChange={e => updateIncentive(inc.id, 'title', e.target.value)} placeholder="e.g. Founding Access" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eligibility Node</label>
                             <select className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none" value={inc.eligible} onChange={e => updateIncentive(inc.id, 'eligible', e.target.value as any)}>
                                <option value="Monetary">Capital Nodes Only</option>
                                <option value="Skill">Specialist Nodes Only</option>
                                <option value="Both">All Registered Nodes</option>
                             </select>
                          </div>
                       </div>
                       <textarea className="w-full p-6 bg-white border border-slate-100 rounded-2xl text-sm font-medium outline-none" rows={2} value={inc.description} onChange={e => updateIncentive(inc.id, 'description', e.target.value)} placeholder="Define the verifiable reward..." />
                    </div>
                 ))}
              </div>
           </div>
        )}

        {step === 8 && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-4">
                 <h2 className="text-3xl font-black uppercase tracking-tight">Resource Anchors</h2>
                 <p className="text-slate-500 font-medium italic">Anchor external documentation and visual identity nodes.</p>
              </div>
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
                 {projectResources.map((res) => (
                    <div key={res.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[3rem] space-y-6">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                             {res.type === 'link' ? <LinkIcon className="w-4 h-4 text-indigo-600" /> : <ImageIcon className="w-4 h-4 text-emerald-600" />}
                             <span className="text-[10px] font-black uppercase tracking-widest">{res.type} Node</span>
                          </div>
                          <button onClick={() => setProjectResources(projectResources.filter(r => r.id !== res.id))} className="text-rose-500 hover:text-rose-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <input className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={res.label} onChange={e => updateResource(res.id, 'label', e.target.value)} placeholder="Resource Identity..." />
                          <input className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-mono outline-none" value={res.url} onChange={e => updateResource(res.id, 'url', e.target.value)} placeholder="URL Anchor..." />
                       </div>
                    </div>
                 ))}
                 <div className="flex gap-4">
                    <button onClick={() => addResource('link')} className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-300 flex items-center justify-center gap-2 text-slate-400 transition-all"><Plus className="w-3 h-3" /> Add Link Node</button>
                    <button onClick={() => addResource('image')} className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-300 flex items-center justify-center gap-2 text-slate-400 transition-all"><Plus className="w-3 h-3" /> Add Image Node</button>
                 </div>
              </div>
           </div>
        )}

        {step === 9 && (
           <div className="space-y-12 animate-in fade-in duration-500 text-left">
              <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Financial Ledger Nodes</h2>
                    <p className="text-slate-500 font-medium italic">Define how capital will be distributed across the lifecycle.</p>
                 </div>
                 <button onClick={addLedgerItem} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">+ Add Ledger Item</button>
              </div>
              
              <div className="p-6 bg-slate-900 rounded-3xl text-white mb-8 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Goal Node</p>
                    <p className="text-3xl font-black">₹{calculateTotalFunding().toLocaleString('en-IN')}</p>
                 </div>
                 <Coins className="w-10 h-10 text-indigo-400 opacity-50" />
              </div>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
                 {ledger.map((item) => (
                    <div key={item.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[3rem] space-y-6 relative group">
                       <button onClick={() => setLedger(ledger.filter(l => l.id !== item.id))} className="absolute top-8 right-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</label>
                             <input className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={item.item} onChange={e => updateLedgerItem(item.id, 'item', e.target.value)} placeholder="e.g. Server Infrastructure" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount ($)</label>
                             <input type="number" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black outline-none" value={item.amount} onChange={e => updateLedgerItem(item.id, 'amount', e.target.value)} placeholder="0.00" />
                          </div>
                       </div>
                       <textarea className="w-full p-6 bg-white border border-slate-100 rounded-2xl text-sm font-medium outline-none" rows={2} value={item.description} onChange={e => updateLedgerItem(item.id, 'description', e.target.value)} placeholder="Define the utility of this capital node..." />
                    </div>
                 ))}
              </div>
           </div>
        )}

        {step === 10 && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-4 text-left">
                 <h2 className="text-3xl font-black uppercase tracking-tight">Capital Reception Node</h2>
                 <p className="text-slate-500 font-medium italic">Configure the UPI reception anchor for capital nodes.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                 <div className="space-y-3">
                    <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">UPI ID Anchor</label>
                    <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-xl outline-none focus:ring-8 focus:ring-indigo-50 transition-all" value={formData.upiId} onChange={e => setFormData({ ...formData, upiId: e.target.value })} placeholder="address@bank" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest pl-1">Reception Display Name</label>
                    <input className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-lg outline-none focus:ring-8 focus:ring-indigo-50 transition-all" value={formData.upiDisplayName} onChange={e => setFormData({ ...formData, upiDisplayName: e.target.value })} placeholder="Identity Name" />
                 </div>
              </div>
           </div>
        )}

        {step === 11 && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="p-16 bg-slate-950 text-white rounded-[4rem] space-y-10 shadow-3xl relative overflow-hidden text-center">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-30" />
                 <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50 mx-auto"><ShieldCheck className="w-12 h-12" /></div>
                 <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-widest">Final Registry Signature</h3>
                    <p className="text-xl text-slate-400 font-medium italic">"I commit this <span className="text-indigo-400 font-black">{formData.projectType.replace('_', ' ')}</span> architecture to the CrowdFundX registry spine."</p>
                 </div>
                 <div className="pt-10 border-t border-white/10 flex justify-between items-center text-left">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead Architect Node</p>
                       <p className="text-2xl font-black text-white uppercase">{creator.name}</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity ID</p>
                       <p className="text-xs font-mono text-indigo-400">{creator.id}</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between">
          <button 
            type="button"
            onClick={step === 1 ? onCancel : () => setStep(step - 1)} 
            className="px-8 py-5 text-slate-400 font-black uppercase text-[11px] tracking-[0.25em] hover:text-slate-900 transition-all"
          >
            {step === 1 ? 'Discard Identity' : 'Back'}
          </button>
          <button 
            type="button"
            onClick={step === TOTAL_STEPS ? handleSubmit : () => setStep(step + 1)} 
            className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            {step === TOTAL_STEPS ? 'Anchor Registry Node' : 'Continue Phase'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
