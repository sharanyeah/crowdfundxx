
import { Project, ProjectStatus, ProjectType } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    creatorId: 'c1',
    creatorName: 'Alex Rivers',
    title: 'Open Source Community Microgrid',
    oneLineSummary: 'Affordable renewable energy management for local communities.',
    category: 'Sustainability',
    projectType: ProjectType.TECH_PRODUCT,
    problem: 'Local communities lack affordable, renewable energy management software. Current solutions are proprietary and prohibitively expensive for small collectives.',
    solution: 'A hardware-agnostic dashboard for managing solar sharing using open-source IoT protocols and a transparent peer-to-peer distribution algorithm.',
    fundingGoal: 25000,
    fundingRaised: 18400,
    backerIds: [],
    pendingAnchors: [],
    upiId: 'alex@upi',
    upiDisplayName: 'Alex Rivers Microgrid',
    // Added projectLinks to satisfy type requirement
    projectLinks: [],
    financialBreakdown: [
      { id: 'f1', item: 'Hardware Procurement', amount: 12000, description: 'Purchase of 50 smart meters and 5 gateway nodes for initial deployment.', status: 'ALLOCATED' },
      { id: 'f2', item: 'Cloud Infrastructure', amount: 3000, description: '2 years of hosting for data aggregation and MQTT broker nodes.', status: 'ESTIMATED' },
      { id: 'f3', item: 'Legal & Compliance', amount: 5000, description: 'Drafting of peer-to-peer energy sharing contracts and utility interfacing permits.', status: 'ALLOCATED' },
      { id: 'f4', item: 'Operating Reserve', amount: 5000, description: 'Emergency buffer for component failure or integration delays.', status: 'ESTIMATED' }
    ],
    skillsNeeded: ['Electrical Engineering', 'Python (Backend)', 'IoT Security Specialist'],
    status: ProjectStatus.ACTIVE,
    reputationScore: 92,
    lastUpdate: new Date().toISOString(),
    updateFrequency: 'WEEKLY',
    milestones: [
      {
        id: 'm1',
        title: 'Prototype V1 Logic',
        description: 'Core logic for solar sharing and peer distribution calculations.',
        goal: 'Deploy locally for testing',
        deliverable: 'Github Repo link with tested logic',
        timeWindow: '2 months',
        status: 'COMPLETED',
        fundRelease: 5000
      },
      {
        id: 'm2',
        title: 'Hardware Integration',
        description: 'Connect to standard smart meters via REST API and MQTT.',
        goal: 'Read real-time data from 5 meter types',
        deliverable: 'Integration demo video',
        timeWindow: '3 months',
        status: 'ACTIVE',
        fundRelease: 10000
      }
    ],
    updates: [
      {
        id: 'u1',
        timestamp: new Date().toISOString(),
        milestoneId: 'm1',
        summary: 'V1 Logic Complete',
        done: 'Implemented the core energy distribution algorithm and basic web dashboard.',
        changed: 'Switched from local DB to Supabase to handle real-time MQTT subscriptions more efficiently.',
        blocked: 'Accessing API keys for specific European smart meter providers.',
        evidence: ['https://github.com/example/microgrid']
      }
    ],
    skillContributors: [
      { 
        id: 's1', 
        userId: 'u2', 
        userName: 'Sarah Chen', 
        skillCategory: 'Technology',
        specificSkill: 'Python (Backend)', 
        level: 'Advanced',
        contributionType: 'Ongoing',
        commitment: '10 hours/week',
        duration: '4 months',
        tasks: 'Leading the development of the community dashboard and visualization components.', 
        output: 'Interactive real-time energy map',
        isLearning: false,
        availability: 'Medium',
        preferredCommunication: 'Discord',
        status: 'APPROVED',
        timestamp: new Date().toISOString()
      }
    ],
    qa: [
      { id: 'q1', userId: 'u3', userName: 'Markus T.', question: 'How will the algorithm handle energy spikes from industrial equipment on the residential grid?', answer: 'We use a buffered priority queue system that redirects excess residential storage before drawing from the mains.', timestamp: '2023-11-05T10:00:00Z' },
      { id: 'q2', userId: 'u4', userName: 'Lila V.', question: 'Is the system compatible with older analog meters via optical sensors?', answer: 'Not currently. We are focusing on digital smart meters with existing API/Modbus support for the first deployment phase.', timestamp: '2023-11-12T09:15:00Z' }
    ],
    auditHistory: [
      { id: 'a1', action: 'PROJECT_START', timestamp: '2023-10-01T10:00:00Z', userId: 'c1', details: 'Project launched with 2 primary milestones. Proof of concept phase.' },
      { id: 'a2', action: 'SKILL_APPROVED', timestamp: '2023-10-05T14:30:00Z', userId: 'c1', details: 'Sarah Chen approved for Python node.' }
    ],
    incentives: [
      {
        id: 'inc1',
        type: 'Public Credit',
        title: 'Network Founding Credit',
        description: 'Permanent acknowledgement in the system spine as a founding node contributor.',
        eligible: 'Both',
        deliveryTiming: 'After Project',
        status: 'Upcoming'
      }
    ],
    hasIncentives: true
  },
  {
    id: '3',
    creatorId: 'c3',
    creatorName: 'Elena Volkov',
    title: 'Neural Accessibility Keyboard',
    oneLineSummary: 'EEG-based text entry for motor-impaired individuals.',
    category: 'Technology',
    projectType: ProjectType.RESEARCH_ACADEMIC,
    problem: 'Standard eye-tracking software is tiring and unreliable for users with severe ALS.',
    solution: 'A BCI (Brain-Computer Interface) software layer that translates specific EEG patterns into keyboard shortcuts.',
    fundingGoal: 12000,
    fundingRaised: 12000,
    backerIds: [],
    pendingAnchors: [],
    upiId: 'elena@upi',
    // Added projectLinks to satisfy type requirement
    projectLinks: [],
    financialBreakdown: [
      { id: 'f5', item: 'Research EEG Kits', amount: 8000, description: 'Clinical grade headsets for patient trials.', status: 'SPENT' },
      { id: 'f6', item: 'Patient Compensation', amount: 2000, description: 'Honorariums for trial participants.', status: 'SPENT' },
      { id: 'f7', item: 'Data Processing Compute', amount: 2000, description: 'GPU instances for training the signal classifier.', status: 'SPENT' }
    ],
    skillsNeeded: ['Neuroscience', 'C++', 'Data Science'],
    status: ProjectStatus.FAILED,
    reputationScore: 35,
    lastUpdate: '2023-08-15T10:00:00Z',
    updateFrequency: 'BI-WEEKLY',
    milestones: [{ id: 'm5', title: 'Signal Processing V1', description: 'Filter raw EEG data for P300 waves.', goal: 'Clear signal extraction', deliverable: 'Matlab scripts', timeWindow: '3 months', status: 'COMPLETED' }],
    updates: [],
    skillContributors: [],
    qa: [
      { id: 'q3', userId: 'u10', userName: 'Dr. Aris', question: 'What was the specific signal-to-noise ratio threshold that caused the milestone failure?', answer: 'We were unable to achieve a stable SNR above 1.5dB in non-laboratory settings, rendering the real-time classification unreliable for consumer headsets.', timestamp: '2023-08-20T11:00:00Z' }
    ],
    auditHistory: [
      { id: 'a5', action: 'PROJECT_START', timestamp: '2023-01-01T10:00:00Z', userId: 'c3', details: 'Neural Keyboard research cycle initialized.' },
      { id: 'a6', action: 'PROJECT_CLOSED', timestamp: '2023-08-15T12:00:00Z', userId: 'c3', details: 'Lifecycle terminated. Failure outcome documented.' }
    ],
    incentives: [],
    hasIncentives: false
  },
  {
    id: '4',
    creatorId: 'c4',
    creatorName: 'Julian Thorne',
    title: 'Modular Urban Mycelium Insulation',
    oneLineSummary: 'Organic, fire-resistant building insulation grown from waste.',
    category: 'Sustainability',
    projectType: ProjectType.TECH_PRODUCT,
    problem: 'Traditional insulation materials like glass wool have high embodied carbon and are difficult to recycle.',
    solution: 'Using local agricultural waste to grow mushroom mycelium into standardized insulation blocks.',
    fundingGoal: 45000,
    fundingRaised: 45000,
    backerIds: [],
    pendingAnchors: [],
    upiId: 'julian@upi',
    // Added projectLinks to satisfy type requirement
    projectLinks: [],
    financialBreakdown: [
      { id: 'f10', item: 'Lab Setup', amount: 25000, description: 'Sterile environment and grow racks.', status: 'SPENT' },
      { id: 'f11', item: 'R&D Lab Testing', amount: 15000, description: 'Fire rating and thermal conductivity certification.', status: 'SPENT' },
      { id: 'f12', item: 'Distribution Prep', amount: 5000, description: 'Packaging and logistics planning.', status: 'SPENT' }
    ],
    skillsNeeded: ['Mycology', 'Building Science', 'Supply Chain Management'],
    status: ProjectStatus.COMPLETED,
    reputationScore: 98,
    lastUpdate: '2024-01-10T14:00:00Z',
    updateFrequency: 'WEEKLY',
    milestones: [
      { id: 'm10', title: 'Growth Protocol', description: 'Standardize growth time to 14 days.', goal: 'Consistent density', deliverable: 'Lab protocol PDF', timeWindow: '4 months', status: 'COMPLETED' },
      { id: 'm11', title: 'Fire Certification', description: 'Pass Class A fire rating test.', goal: 'Safety certification', deliverable: 'Official test report', timeWindow: '3 months', status: 'COMPLETED' }
    ],
    updates: [],
    skillContributors: [
      { id: 's10', userId: 'u10', userName: 'Maya Lin', skillCategory: 'Sustainability', specificSkill: 'Mycology Specialist', level: 'Advanced', contributionType: 'Ongoing', commitment: 'Full-time', duration: '6 months', tasks: 'Directing the mushroom growth cycles and spore management.', output: 'Optimized growth cycle V2', status: 'COMPLETED', timestamp: '2023-05-10T10:00:00Z', isLearning: false, availability: 'Low', preferredCommunication: 'Email' }
    ],
    qa: [
      { id: 'q4', userId: 'u15', userName: 'Architect Sam', question: 'How do the blocks handle high-humidity tropical environments without molding?', answer: 'The blocks undergo a heat-curing phase at the end of the growth cycle which deactivates the mycelium and prevents future mold development.', timestamp: '2023-12-05T14:00:00Z' }
    ],
    auditHistory: [
      { id: 'a10', action: 'PROJECT_START', timestamp: '2023-05-01T10:00:00Z', userId: 'c4', details: 'Mycelium Insulation node initialized.' },
      { id: 'a11', action: 'PROJECT_CLOSED', timestamp: '2024-01-10T14:00:00Z', userId: 'c4', details: 'Project achieved all milestones. Outcome: Exemplary Case Study.' }
    ],
    incentives: [],
    hasIncentives: false
  }
];

export const CATEGORIES = ['Technology', 'Sustainability', 'Social Impact', 'Arts', 'Agriculture', 'Education'];
