
export enum UserRole {
  CREATOR = 'CREATOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
  SKILL_CONTRIBUTOR = 'SKILL_CONTRIBUTOR',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  ANONYMOUS = 'ANONYMOUS',
  REGISTERED = 'REGISTERED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  ROLE_VERIFIED = 'ROLE_VERIFIED',
  RESTRICTED = 'RESTRICTED'
}

export interface Notification {
  id: string;
  userId: string;
  type: 'INQUIRY' | 'SKILL_APPLICATION' | 'FUNDING' | 'MILESTONE' | 'SYSTEM' | 'INCENTIVE';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: { view: string; id?: string; itemId?: string };
  applicantId?: string;
}

export interface ExternalLink {
  id: string;
  label: string;
  url: string;
  type: 'link' | 'image';
}

export interface User {
  id: string;
  name: string;
  role: UserRole[];
  verificationStatus: VerificationStatus;
  reputation: number;
  email: string;
  avatar: string;
  bio?: string;
  currentRole?: string;
  workDescription?: string;
  portfolio?: string;
  upiId?: string;
  socialLinks: { id: string; label: string; url: string }[];
  institutionalProof?: string;
  pastProjectsCount?: { completed: number; failed: number };
  updateConsistency?: number; // 0-100
  notifications?: Notification[];
  disabled?: boolean;
}

export enum ProjectStatus {
  REVIEW = 'REVIEW',
  ACTIVE = 'ACTIVE',
  STALLED = 'STALLED',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  UNDER_REVIEW = 'UNDER_REVIEW' // Admin Freeze State
}

export enum ProjectType {
  CREATIVE = 'CREATIVE',
  TECH_PRODUCT = 'TECH_PRODUCT',
  RESEARCH_ACADEMIC = 'RESEARCH_ACADEMIC',
  SOCIAL_IMPACT = 'SOCIAL_IMPACT',
  LEARNING_EXPERIMENT = 'LEARNING_EXPERIMENT',
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  goal: string;
  deliverable: string;
  timeWindow: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  fundRelease?: number;
  evidenceLink?: string;
}

export interface FinancialNode {
  id: string;
  item: string;
  amount: number;
  description: string;
  status: 'ESTIMATED' | 'ALLOCATED' | 'SPENT';
}

export interface ProjectUpdate {
  id: string;
  timestamp: string;
  milestoneId: string;
  summary: string;
  done: string;
  changed: string;
  blocked: string;
  evidence: string[];
}

export type SkillStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'ENDED_EARLY';

export interface SkillContribution {
  id: string;
  userId: string;
  userName: string;
  skillCategory: string;
  specificSkill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  contributionType: 'One-time' | 'Ongoing' | 'Advisory';
  commitment: string; 
  duration: string;   
  tasks: string;      
  output: string;     
  proof?: string;     
  isLearning: boolean;
  availability: 'Low' | 'Medium' | 'High';
  preferredCommunication: string;
  status: SkillStatus;
  timestamp: string;
  completionNote?: string;
}

export interface ParticipationIncentive {
  id: string;
  type: string;
  title: string;
  description: string;
  eligible: 'Monetary' | 'Skill' | 'Both';
  minContribution?: string;
  deliveryTiming: 'After Milestone' | 'After Project';
  unlockedAtMilestoneId?: string;
  status: 'Upcoming' | 'Unlocked' | 'Delivered';
}

export interface PendingAnchor {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: string;
  upiRefId?: string;
  proofUrl?: string; 
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type UpdateFrequency = 'DAILY' | 'WEEKLY' | 'BI-WEEKLY' | 'MONTHLY' | 'MILESTONE';

export interface Project {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  oneLineSummary: string;
  category: string;
  projectType: ProjectType;
  problem: string;
  solution: string;
  
  // Use-case specific details
  stack?: string;
  methodology?: string;
  equipment?: string;

  // Financial Structure
  fundingGoal: number;
  fundingRaised: number;
  financialBreakdown: FinancialNode[];
  backerIds: string[]; 
  pendingAnchors: PendingAnchor[];

  // UPI Anchoring
  upiId?: string;
  upiDisplayName?: string;

  // Resource Nodes (Links & Images)
  projectLinks: ExternalLink[];
  contactEmail?: string;
  duration?: string; // e.g. "6 Months"

  // Skill Structure
  skillsNeeded: string[];
  skillContributors: SkillContribution[];
  
  status: ProjectStatus;
  reputationScore: number;
  lastUpdate: string;
  updateFrequency: UpdateFrequency;
  milestones: Milestone[];
  updates: ProjectUpdate[];
  qa: ProjectQA[];
  auditHistory: AuditLog[];
  
  incentives: ParticipationIncentive[];
  hasIncentives: boolean;
  previousStatus?: ProjectStatus; // Track for unfreezing
}

export interface ProjectQA {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: 'PROJECT_START' | 'MILESTONE_COMPLETE' | 'UPDATE_POSTED' | 'SKILL_APPROVED' | 'SKILL_COMPLETED' | 'SKILL_ENDED_EARLY' | 'PROJECT_CLOSED' | 'REPUTATION_ADJUST' | 'INCENTIVE_ADD' | 'CAPITAL_ANCHOR_PENDING' | 'CAPITAL_ANCHOR_APPROVED' | 'CAPITAL_ANCHOR_REJECTED' | 'ARCHITECT_REVISION' | 'PROJECT_FROZEN_BY_ADMIN' | 'PROJECT_UNFROZEN_BY_ADMIN' | 'USER_DISABLED_BY_ADMIN' | 'USER_ENABLED_BY_ADMIN';
  timestamp: string;
  userId: string;
  details: string;
}
