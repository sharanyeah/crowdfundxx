
import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  RefreshCw, 
  BarChart3, 
  ArrowRight, 
  Cpu, 
  Layers, 
  History, 
  Award, 
  FileText, 
  Activity, 
  Users,
  Database,
  ArrowUpRight,
  Gavel,
  Briefcase,
  Globe,
  Lock,
  Zap,
  Microscope,
  CheckCircle2,
  AlertCircle,
  Coins,
  Search,
  Code
} from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onExplore, onStart }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden font-sans">
      
      {/* ⚡ HERO: DIRECT ACTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 pb-20 border-b border-border bg-white">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/graph-paper.png')]" />
        
        <div className="max-w-6xl w-full text-center z-10 space-y-12">
          <div className="space-y-8 animate-in slide-in-from-bottom duration-1000">
            <div className="inline-flex items-center gap-4 bg-slate-50 border border-border px-6 py-2 rounded-full shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-cobalt animate-ping" />
              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.4em]">Honest Crowdfunding System</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black text-ink tracking-tighter leading-[0.82] uppercase">
              Fund Ideas. <br />
              <span className="text-cobalt">Track Progress.</span>
            </h1>
            
            <p className="text-xl md:text-3xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-medium italic font-serif">
              "Most platforms focus on the hype. <br className="hidden md:block" />
              We focus on <span className="text-ink not-italic font-black">getting things done.</span>"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom delay-300 duration-1000">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-16 py-7 bg-ink text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] hover:bg-cobalt hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200"
            >
              Start a Project <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onExplore}
              className="w-full sm:w-auto px-16 py-7 bg-white border-2 border-border text-ink rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] hover:border-cobalt transition-all flex items-center justify-center gap-2"
            >
              See Projects
            </button>
          </div>
        </div>

        {/* 📊 NETWORK VITALS STRIP */}
        <div className="absolute bottom-0 left-0 w-full border-t border-border bg-slate-50/50 py-6 overflow-hidden">
          <div className="max-w-7xl mx-auto px-12 flex flex-wrap justify-between items-center gap-8 opacity-60">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Active Projects:</span>
              <span className="text-sm font-mono font-black text-ink">1,204</span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-8">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Experts Joined:</span>
              <span className="text-sm font-mono font-black text-ink">842</span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-8">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Money Raised:</span>
              <span className="text-sm font-mono font-black text-ink">₹40 Cr</span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-8">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">System Trust:</span>
              <span className="text-sm font-mono font-black text-emerald-600">99.98%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ⚖️ THE COMPARISON */}
      <section className="py-32 px-6 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-[12px] font-black text-cobalt uppercase tracking-[0.5em]">The Difference</h2>
            <p className="text-4xl md:text-5xl font-black text-ink uppercase tracking-tight">Why Choose TrustFund?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="bg-slate-50 p-16 space-y-12">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">The Old Way</span>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Hype & Hope</h3>
              </div>
              <ul className="space-y-8">
                {[
                  "Money is raised and then people disappear.",
                  "Zero updates once the goal is hit.",
                  "Success is only about the money.",
                  "Failed projects just stop responding.",
                  "You can only help if you have cash."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start text-slate-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-lg font-medium italic">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-16 space-y-12">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-cobalt uppercase tracking-widest">The TrustFund Way</span>
                <h3 className="text-3xl font-black text-ink uppercase tracking-tighter">Action & Proof</h3>
              </div>
              <ul className="space-y-8">
                {[
                  "Money is released as work gets done.",
                  "Regular, honest updates are required.",
                  "Success is about finishing what you started.",
                  "Failure is explained and learned from.",
                  "Contribute your skills or your support."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start text-ink">
                    <CheckCircle2 className="w-5 h-5 text-cobalt shrink-0 mt-0.5" />
                    <span className="text-lg font-black tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 🧬 THE FLOW: HOW IT WORKS */}
      <section className="py-32 px-6 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10 mb-24">
            <div className="space-y-4 text-left">
              <h2 className="text-[12px] font-black text-cobalt uppercase tracking-[0.4em]">Simple Steps</h2>
              <p className="text-4xl md:text-6xl font-black text-ink uppercase tracking-tight">How Projects Work</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm font-mono font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Build Trust. Step by Step.</p>
              <div className="h-1 bg-slate-200 w-64 rounded-full ml-auto overflow-hidden"><div className="h-full bg-cobalt w-3/4" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              { 
                step: "01", 
                phase: "Clear Planning", 
                icon: <Target className="w-6 h-6" />,
                details: "Creators set clear goals and a roadmap. Every dollar has a specific job to do.",
                outcome: "Solid Foundation"
              },
              { 
                step: "02", 
                phase: "Gather Support", 
                icon: <Layers className="w-6 h-6" />,
                details: "People contribute money or expert skills. The team and budget come together.",
                outcome: "Team Ready"
              },
              { 
                step: "03", 
                phase: "Honest Updates", 
                icon: <Activity className="w-6 h-6" />,
                details: "Updates show real progress. If there's a problem, the community helps solve it.",
                outcome: "Steady Work"
              },
              { 
                step: "04", 
                phase: "Final Results", 
                icon: <Database className="w-6 h-6" />,
                details: "The project finishes and becomes a case study. Everyone's reputation grows.",
                outcome: "Proven Success"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-border p-10 rounded-[3.5rem] flex flex-col h-full hover:border-cobalt transition-all group shadow-sm hover:shadow-xl">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-cobalt group-hover:bg-cobalt group-hover:text-white transition-all shadow-inner">
                    {item.icon}
                  </div>
                  <span className="text-sm font-mono font-black text-slate-200 group-hover:text-indigo-100 transition-colors uppercase tracking-widest">{item.step}</span>
                </div>
                <div className="flex-1 space-y-4 text-left">
                  <h3 className="text-xl font-black text-ink uppercase tracking-tight leading-none">{item.phase}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{item.details}"</p>
                </div>
                <div className="mt-10 pt-6 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Final Result</p>
                  <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">{item.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏗️ DUAL CONTRIBUTION */}
      <section className="py-32 px-6 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="relative">
              <div className="p-16 bg-slate-950 rounded-[4rem] text-white space-y-12 shadow-3xl overflow-hidden group">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-20 transition-transform duration-1000 group-hover:scale-110" />
                 
                 <div className="space-y-4 relative z-10">
                    <p className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-[0.4em]">Contribute Your Way</p>
                    <h3 className="text-4xl font-black uppercase tracking-tight leading-none">Money or Skills. <br /> Both Matter.</h3>
                 </div>

                 <div className="space-y-8 relative z-10">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-6">
                       <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-inner">
                          <Coins className="w-7 h-7" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-widest">Budget Nodes</p>
                          <p className="text-[11px] text-slate-500 font-medium">Money released as milestones are finished.</p>
                       </div>
                    </div>
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-6">
                       <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-inner">
                          <Briefcase className="w-7 h-7" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-widest">Expert Nodes</p>
                          <p className="text-[11px] text-slate-500 font-medium">Contribute your talent and build your resume.</p>
                       </div>
                    </div>
                 </div>

                 <p className="text-xs font-medium text-slate-400 italic leading-relaxed pt-8 border-t border-white/10 relative z-10">
                    "On TrustFund, doing the work is just as valuable as funding it."
                 </p>
              </div>
           </div>

           <div className="space-y-12 text-left">
              <div className="space-y-6">
                <h2 className="text-[12px] font-black text-cobalt uppercase tracking-[0.4em]">Our System</h2>
                <p className="text-5xl font-black text-ink uppercase tracking-tighter leading-[0.95]">Built for <br /> Accountability.</p>
                <p className="text-lg text-slate-500 leading-relaxed font-medium italic">"We replaced promises with proof. Our system ensures every project is transparent from day one."</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8">
                 {[
                   { icon: <Gavel className="w-5 h-5" />, title: "Safe & Secure", desc: "Admins protect your contributions from stalled or fake projects." },
                   { icon: <ShieldCheck className="w-5 h-5" />, title: "Real Identities", desc: "We verify everyone involved so you know who you are working with." },
                   { icon: <History className="w-5 h-5" />, title: "Permanent Records", desc: "Every update is saved forever. You can't delete your mistakes." },
                   { icon: <Award className="w-5 h-5" />, title: "Build Your Score", desc: "Earn reputation points for every successful project you help." }
                 ].map((gov, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex items-center gap-3 text-cobalt">
                        {gov.icon}
                        <h4 className="font-black uppercase tracking-widest text-[11px]">{gov.title}</h4>
                      </div>
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic">"{gov.desc}"</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 🏁 FINAL CTA */}
      <section className="py-40 px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute -top-[50%] -left-[20%] w-[100rem] h-[100rem] bg-indigo-600 rounded-full blur-[150px] opacity-10 animate-pulse" />
        
        <div className="max-w-5xl mx-auto text-center space-y-16 relative z-10">
          <div className="space-y-6">
            <p className="text-[12px] font-mono font-black text-indigo-400 uppercase tracking-[0.5em]">System Status: Ready to Launch</p>
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">Ready to Start?</h2>
            <p className="text-2xl text-slate-400 font-medium italic max-w-3xl mx-auto">"Don't just raise money. Build something that lasts."</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-16 py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[13px] hover:bg-white hover:text-ink transition-all shadow-3xl shadow-indigo-500/20"
            >
              Start Your Project
            </button>
            <button 
              onClick={onExplore}
              className="w-full sm:w-auto px-16 py-8 border-2 border-white/20 text-white/50 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[13px] hover:border-white hover:text-white transition-all"
            >
              See All Projects
            </button>
          </div>

          <div className="pt-20 flex flex-col items-center gap-6 opacity-30">
            <div className="w-48 h-px bg-white/20" />
            <div className="flex gap-10">
              <span className="text-[10px] font-mono text-white tracking-[0.5em] uppercase">Security: High</span>
              <span className="text-[10px] font-mono text-white tracking-[0.5em] uppercase">Trust: Verified</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-white border-t border-border flex flex-col items-center gap-4 text-slate-400">
        <div className="flex items-center gap-3">
           <ShieldCheck className="w-5 h-5 text-cobalt opacity-50" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">CrowdFundX — Build Trust with Action.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
