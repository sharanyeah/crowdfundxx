import React, { useState } from 'react';
import { User, UserRole, VerificationStatus, ExternalLink } from '../types';
import { Shield, X, LogIn, Plus, Trash2, Github, Linkedin, Globe, Twitter } from 'lucide-react';

interface AuthFlowProps {
  onComplete: (user: User) => void;
  onCancel: () => void;
  initialIntent?: UserRole;
}

const SOCIAL_PLATFORMS = [
  { value: 'LinkedIn', icon: Linkedin },
  { value: 'GitHub', icon: Github },
  { value: 'Twitter', icon: Twitter },
  { value: 'Website', icon: Globe },
  { value: 'Portfolio', icon: Globe },
  { value: 'Other', icon: Globe }
];

const AuthFlow: React.FC<AuthFlowProps> = ({ onComplete, onCancel, initialIntent }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signin');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    currentRole: '',
    workDescription: '',
    roles: initialIntent ? [initialIntent] : [] as UserRole[],
    portfolio: '',
    socialLinks: [] as ExternalLink[]
  });

  const toggleRole = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role) 
        : [...prev.roles, role]
    }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: `l-${Date.now()}`, label: 'LinkedIn', url: '', type: 'link' as const }]
    }));
  };

  const removeSocialLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(l => l.id !== id)
    }));
  };

  const updateSocialLink = (id: string, field: 'label' | 'url', val: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(l => l.id === id ? { ...l, [field]: val } : l)
    }));
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) return;
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Invalid credentials');
        return;
      }
      const user = await response.json();
      onComplete(user);
    } catch (error) {
      alert('Authentication failed');
    }
  };

  const finishAuth = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.roles,
          verificationStatus: VerificationStatus.ROLE_VERIFIED,
          bio: formData.bio,
          currentRole: formData.currentRole,
          workDescription: formData.workDescription,
          portfolio: formData.portfolio,
          socialLinks: formData.socialLinks.filter(l => l.url)
        })
      });
      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Registration failed');
        return;
      }
      const user = await response.json();
      onComplete(user);
    } catch (error) {
      alert('Registration failed');
    }
  };

  const getStepTitle = () => {
    if (mode === 'signin') return 'Sign In';
    switch (step) {
      case 1: return 'Create Account';
      case 2: return 'About You';
      case 3: return 'Your Role';
      case 4: return 'Social Links';
      default: return 'Sign Up';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-border">
        
        <div className="px-12 pt-12 pb-6 flex justify-between items-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cobalt/5 border border-cobalt/10 rounded-full">
              <Shield className="w-3.5 h-3.5 text-cobalt" />
              <span className="text-[10px] font-black text-cobalt uppercase tracking-[0.2em]">CrowdFundX Registry</span>
            </div>
            <h2 className="text-4xl font-black text-ink tracking-tighter uppercase leading-none">
              {getStepTitle()}
            </h2>
            {mode === 'signup' && (
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 w-12 rounded-full transition-all ${s <= step ? 'bg-cobalt' : 'bg-slate-100'}`} />
                ))}
              </div>
            )}
          </div>
          <button onClick={onCancel} className="p-2 text-slate-300 hover:text-ink transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-12 pb-12 max-h-[70vh] overflow-y-auto">
          {mode === 'signin' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com" 
                    className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-bold text-ink focus:ring-4 focus:ring-indigo-50"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-bold text-ink focus:ring-4 focus:ring-indigo-50"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={handleSignIn}
                disabled={!formData.email || !formData.password}
                className="w-full py-6 bg-ink text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl hover:bg-cobalt transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                Sign In <LogIn className="w-4 h-4" />
              </button>
              
              <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                New here? <button onClick={() => setMode('signup')} className="text-cobalt hover:underline">Create Account</button>
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
               {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                      <input type="text" placeholder="Your full name" className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                      <input type="email" placeholder="email@example.com" className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                      <input type="password" placeholder="Create a secure password" className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} disabled={!formData.name || !formData.email || !formData.password} className="w-full py-6 bg-ink text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest disabled:opacity-30">Continue</button>
                  <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Already have an account? <button onClick={() => setMode('signin')} className="text-cobalt hover:underline">Sign In</button>
                  </p>
                </div>
               )}

               {step === 2 && (
                 <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Current Role / Title</label>
                        <input type="text" placeholder="e.g. Software Engineer, Designer, Student" className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-bold" value={formData.currentRole} onChange={e => setFormData({...formData, currentRole: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Short Bio</label>
                        <textarea placeholder="Tell us a bit about yourself and your expertise..." className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-medium h-32 resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Work Description (Optional)</label>
                        <textarea placeholder="Describe your professional experience, skills, and what you're looking for..." className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-medium h-24 resize-none" value={formData.workDescription} onChange={e => setFormData({...formData, workDescription: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setStep(1)} className="flex-1 py-5 border border-border rounded-2xl font-black uppercase text-[10px] hover:bg-slate-50 transition-colors">Back</button>
                       <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-ink text-white rounded-2xl font-black uppercase text-[10px]">Continue</button>
                    </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-8">
                    <p className="text-sm text-slate-500 font-medium">How do you want to participate? Select all that apply:</p>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { role: UserRole.CREATOR, title: 'Project Creator', desc: 'Launch and manage crowdfunding projects' },
                        { role: UserRole.SKILL_CONTRIBUTOR, title: 'Skill Contributor', desc: 'Offer your expertise to help projects succeed' },
                        { role: UserRole.CONTRIBUTOR, title: 'Capital Contributor', desc: 'Fund projects you believe in' }
                      ].map(({ role, title, desc }) => (
                        <button key={role} onClick={() => toggleRole(role)} className={`p-6 border-2 rounded-[2rem] text-left transition-all ${formData.roles.includes(role) ? 'border-cobalt bg-cobalt/5' : 'border-slate-100 hover:border-slate-200'}`}>
                          <h4 className="font-black text-sm uppercase text-ink">{title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setStep(2)} className="flex-1 py-5 border border-border rounded-2xl font-black uppercase text-[10px] hover:bg-slate-50 transition-colors">Back</button>
                       <button onClick={() => setStep(4)} disabled={formData.roles.length === 0} className="flex-[2] py-5 bg-ink text-white rounded-2xl font-black uppercase text-[10px] disabled:opacity-30">Continue</button>
                    </div>
                 </div>
               )}

               {step === 4 && (
                 <div className="space-y-8">
                    <p className="text-sm text-slate-500 font-medium">Add your social profiles and portfolio links so others can learn more about you:</p>
                    
                    <div className="space-y-4">
                      {formData.socialLinks.map((link) => (
                        <div key={link.id} className="flex gap-3 items-center">
                          <select 
                            value={link.label} 
                            onChange={e => updateSocialLink(link.id, 'label', e.target.value)}
                            className="px-4 py-4 bg-surface border border-border rounded-xl outline-none font-bold text-sm w-36"
                          >
                            {SOCIAL_PLATFORMS.map(p => (
                              <option key={p.value} value={p.value}>{p.value}</option>
                            ))}
                          </select>
                          <input 
                            type="url" 
                            placeholder="https://..." 
                            value={link.url}
                            onChange={e => updateSocialLink(link.id, 'url', e.target.value)}
                            className="flex-1 px-5 py-4 bg-surface border border-border rounded-xl outline-none font-medium text-sm"
                          />
                          <button onClick={() => removeSocialLink(link.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={addSocialLink}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-cobalt hover:text-cobalt transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Social Link
                      </button>
                    </div>

                    <div className="pt-4 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Portfolio URL (Optional)</label>
                      <input 
                        type="url" 
                        placeholder="https://yourportfolio.com" 
                        className="w-full px-6 py-5 bg-surface border border-border rounded-2xl outline-none font-medium" 
                        value={formData.portfolio} 
                        onChange={e => setFormData({...formData, portfolio: e.target.value})} 
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                       <button onClick={() => setStep(3)} className="flex-1 py-5 border border-border rounded-2xl font-black uppercase text-[10px] hover:bg-slate-50 transition-colors">Back</button>
                       <button onClick={finishAuth} className="flex-[2] py-5 bg-cobalt text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-indigo-700 transition-colors">Create Account</button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
