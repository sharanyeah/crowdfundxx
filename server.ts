import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getDb } from './services/mongodb';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.SESSION_SECRET || 'crowdfundx-spine-secret';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Initialize MongoDB connection on server start
connectToDatabase()
  .then(() => {
    // Create indexes for performance and constraints
    const db = getDb();
    db.collection('users').createIndex({ email: 1 }, { unique: true });
    db.collection('users').createIndex({ id: 1 }, { unique: true });
    db.collection('projects').createIndex({ id: 1 }, { unique: true });

    app.listen(port, () => {
      console.log(`Backend server running on http://0.0.0.0:${port}`);
    });
  })
  .catch((err) => {
    console.error('Server failed to start due to database connection error:', err);
    process.exit(1);
  });

// Projects API
app.get('/api/projects', async (req, res) => {
  try {
    const db = getDb();
    const projects = await db.collection('projects').find({}).toArray();
    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Update a single project
app.patch('/api/projects/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const db = getDb();
    const id = req.params.id;
    const updates = req.body;
    
    // Safety check: only creator or admin can update
    const project = await db.collection('projects').findOne({ id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const isAdmin = req.user.role && req.user.role.includes('ADMIN');
    if (project.creatorId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to update this project' });
    }

    delete updates._id;
    const result = await db.collection('projects').updateOne({ id: id }, { $set: updates });
    res.json({ success: true });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const projects = req.body;
    await db.collection('projects').deleteMany({});
    if (projects.length > 0) {
      const cleanedProjects = projects.map((p: any) => {
        const { _id, ...rest } = p;
        return rest;
      });
      await db.collection('projects').insertMany(cleanedProjects);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save projects' });
  }
});

// User API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const db = getDb();
    const { email, password, name, ...rest } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields: email, password, and name' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Identity already registered' });
    
    const newUser = { 
      ...rest, 
      name,
      email: email.toLowerCase(), 
      password, // Note: In production use bcrypt
      id: `u-${Date.now()}`, 
      notifications: [], 
      reputation: 50, 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` 
    };
    await db.collection('users').insertOne(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    const token = jwt.sign({ email: newUser.email, id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res: any) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Session verification failed' });
  }
});

app.get('/api/user/:email', async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/user', authenticateToken, async (req: any, res: any) => {
  try {
    const db = getDb();
    const userUpdates = req.body;
    
    // Safety check: users can only update their own profile
    if (userUpdates.email && userUpdates.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    delete userUpdates._id;
    await db.collection('users').updateOne({ email: req.user.email }, { $set: userUpdates }, { upsert: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

app.post('/api/notifications', authenticateToken, async (req: any, res: any) => {
  try {
    const db = getDb();
    const { targetUserId, notification } = req.body;
    
    // Safety check: ensure notification has a unique ID if not present
    if (!notification.id) {
      notification.id = `n-${Date.now()}`;
    }
    notification.timestamp = new Date().toISOString();
    notification.read = false;

    const result = await db.collection('users').updateOne(
      { id: targetUserId }, 
      { $push: { notifications: { $each: [notification], $position: 0 } } }
    );
    res.json({ success: result.modifiedCount > 0 });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('projects').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

app.post('/api/seed', async (req, res) => {
  try {
    const db = getDb();
    await db.collection('projects').deleteMany({});
    await db.collection('users').deleteMany({});
    
    const dummyUsers = [
      { id: 'user-tech-001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', password: 'password123', role: ['CREATOR'], verificationStatus: 'ROLE_VERIFIED', reputation: 85, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aarav.sharma@example.com', bio: 'Full-stack developer from Bangalore.', notifications: [] },
      { id: 'user-sustain-001', name: 'Ishani Patel', email: 'ishani.patel@example.com', password: 'password123', role: ['CREATOR'], verificationStatus: 'ROLE_VERIFIED', reputation: 92, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ishani.patel@example.com', bio: 'Environmental researcher in Mumbai.', notifications: [] },
      { id: 'user-social-001', name: 'Vihaan Gupta', email: 'vihaan.gupta@example.com', password: 'password123', role: ['CREATOR'], verificationStatus: 'ROLE_VERIFIED', reputation: 88, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vihaan.gupta@example.com', bio: 'Social activist and educator.', notifications: [] },
      { id: 'user-arts-001', name: 'Ananya Iyer', email: 'ananya.iyer@example.com', password: 'password123', role: ['CREATOR'], verificationStatus: 'ROLE_VERIFIED', reputation: 78, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya.iyer@example.com', bio: 'Classical dancer and digital artist.', notifications: [] },
      { id: 'user-agri-001', name: 'Arjun Reddy', email: 'arjun.reddy@example.com', password: 'password123', role: ['CREATOR'], verificationStatus: 'ROLE_VERIFIED', reputation: 90, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun.reddy@example.com', bio: 'Agri-tech innovator from Hyderabad.', notifications: [] },
      { id: 'user-edu-001', name: 'Saanvi Nair', email: 'saanvi.nair@example.com', password: 'password123', role: ['CREATOR'], verificationStatus: 'ROLE_VERIFIED', reputation: 95, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saanvi.nair@example.com', bio: 'Ed-tech specialist in Kerala.', notifications: [] }
    ];
    await db.collection('users').insertMany(dummyUsers);
    
    const dummyProjects = [
      { 
        id: 'proj-tech-001', 
        creatorId: 'user-tech-001', 
        creatorName: 'Aarav Sharma', 
        title: 'Smart City Traffic Optimizer', 
        oneLineSummary: 'AI-driven traffic flow management.', 
        category: 'Technology', 
        projectType: 'TECH_PRODUCT', 
        fundingGoal: 35000, 
        fundingRaised: 12500, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'aarav@upi', 
        upiDisplayName: 'Aarav Tech', 
        projectLinks: [{ id: 'l1', label: 'GitHub Repo', url: 'https://github.com/aarav/traffic-opt', type: 'link' }], 
        contactEmail: 'aarav.sharma@example.com', 
        duration: '8 Months', 
        financialBreakdown: [
          { id: 'f1', item: 'Cloud Compute', amount: 15000, description: 'GPU instances for model training.', status: 'ALLOCATED' },
          { id: 'f2', item: 'IoT Sensors', amount: 10000, description: 'Deployment of 100 sensors.', status: 'ESTIMATED' },
          { id: 'f3', item: 'Legal & Permits', amount: 5000, description: 'City council approvals.', status: 'ALLOCATED' },
          { id: 'f4', item: 'Hardware Maintenance', amount: 5000, description: 'Spares for sensor nodes.', status: 'ESTIMATED' }
        ], 
        skillsNeeded: ['AI/ML', 'Cloud Computing', 'Embedded Systems'], 
        skillContributors: [
          { id: 'sc1', userId: 'u2', userName: 'Karan Singh', skillCategory: 'Technology', specificSkill: 'ML Engineer', level: 'Advanced', contributionType: 'Ongoing', commitment: '10h/week', duration: '6m', tasks: 'Model optimization and inference scaling.', output: 'V1 Algorithm with 92% accuracy', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: false, availability: 'Medium', preferredCommunication: 'Slack' },
          { id: 'sc2', userId: 'u3', userName: 'Priya Verma', skillCategory: 'Technology', specificSkill: 'IoT Developer', level: 'Intermediate', contributionType: 'Ongoing', commitment: '15h/week', duration: '4m', tasks: 'Sensor firmware development.', output: 'Firmware V1.2', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: true, availability: 'High', preferredCommunication: 'Discord' }
        ], 
        status: 'ACTIVE', 
        reputationScore: 85, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm1', title: 'Algorithm Alpha', description: 'Core flow logic and basic traffic simulation.', goal: '90% accuracy', deliverable: 'Source Code & Simulation Video', timeWindow: '3 Months', status: 'COMPLETED', fundRelease: 5000 },
          { id: 'm2', title: 'Sensor Network Alpha', description: 'Deploy 20 sensors in a pilot area.', goal: 'Reliable data streaming', deliverable: 'Data Dashboard', timeWindow: '2 Months', status: 'ACTIVE', fundRelease: 10000 },
          { id: 'm3', title: 'City Integration', description: 'Link with municipal traffic signals.', goal: 'Automated signal control', deliverable: 'Pilot Report', timeWindow: '3 Months', status: 'PENDING', fundRelease: 15000 }
        ], 
        updates: [
          { id: 'u1', timestamp: new Date().toISOString(), milestoneId: 'm1', summary: 'Alpha Test Complete', done: 'Achieved 92% accuracy in simulations.', changed: 'Switched from TensorFlow to PyTorch for better latency.', blocked: 'None', evidence: ['https://example.com/demo-video'] },
          { id: 'u2', timestamp: new Date().toISOString(), milestoneId: 'm2', summary: 'Pilot Deployment Started', done: 'Installed 10 sensors at M.G. Road intersection.', changed: 'Using solar-powered nodes instead of battery.', blocked: 'Waiting for high-speed connectivity at 2 points.', evidence: [] }
        ], 
        qa: [
          { id: 'q1', userId: 'u3', userName: 'Rohan M.', question: 'How does it handle extreme weather conditions like monsoon rain?', answer: 'We use IP67-rated enclosures for all sensors and robust computer vision filters to reduce noise.', timestamp: new Date().toISOString() },
          { id: 'q2', userId: 'u4', userName: 'Anita S.', question: 'Is the data encrypted?', answer: 'Yes, all data from sensors to the cloud is encrypted using AES-256.', timestamp: new Date().toISOString() }
        ], 
        auditHistory: [
          { id: 'a1', action: 'PROJECT_START', timestamp: new Date().toISOString(), userId: 'user-tech-001', details: 'Project launched.' },
          { id: 'a2', action: 'MILESTONE_COMPLETE', timestamp: new Date().toISOString(), userId: 'user-tech-001', details: 'Algorithm Alpha milestone verified.' }
        ], 
        incentives: [
          { id: 'inc1', type: 'Credit', title: 'Founding Engineer Badge', description: 'Permanent recognition as a founding contributor.', eligible: 'Skill', deliveryTiming: 'After Project', status: 'Upcoming' },
          { id: 'inc2', type: 'Monetary', title: 'Alpha Bonus', description: 'Cash bonus for early milestone completion.', eligible: 'Both', minContribution: '100h', deliveryTiming: 'After Milestone', unlockedAtMilestoneId: 'm1', status: 'Delivered' }
        ], 
        hasIncentives: true, 
        problem: 'Increasing traffic congestion in urban areas leading to lost time and higher pollution.', 
        solution: 'Smart signal timing using real-time IoT data and AI-driven optimization algorithms.' 
      },
      { 
        id: 'proj-tech-002', 
        creatorId: 'user-tech-001', 
        creatorName: 'Aarav Sharma', 
        title: 'Blockchain Identity Vault', 
        oneLineSummary: 'Secure decentralized identity management.', 
        category: 'Technology', 
        projectType: 'TECH_PRODUCT', 
        fundingGoal: 50000, 
        fundingRaised: 5000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'aarav2@upi', 
        upiDisplayName: 'Vault Labs', 
        projectLinks: [{ id: 'l2', label: 'Whitepaper', url: 'https://vault.labs/whitepaper', type: 'link' }], 
        contactEmail: 'aarav.sharma@example.com', 
        duration: '12 Months', 
        financialBreakdown: [
          { id: 'f3', item: 'Security Audit', amount: 15000, description: 'Comprehensive third-party smart contract audit.', status: 'ESTIMATED' },
          { id: 'f4', item: 'Frontend Dev', amount: 15000, description: 'Web and Mobile DApp interface development.', status: 'ALLOCATED' },
          { id: 'f5', item: 'ZK-Proof Research', amount: 20000, description: 'Integrating Zero-Knowledge proofs for privacy.', status: 'ESTIMATED' }
        ], 
        skillsNeeded: ['Solidity', 'Web3', 'Cryptography'], 
        skillContributors: [
          { id: 'sc3', userId: 'u10', userName: 'Dev Kartikeya', skillCategory: 'Technology', specificSkill: 'Blockchain Dev', level: 'Advanced', contributionType: 'Ongoing', commitment: '20h/week', duration: '12m', tasks: 'Writing and testing ERC-725 contracts.', output: 'Initial Draft', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: false, availability: 'Low', preferredCommunication: 'Telegram' }
        ], 
        status: 'ACTIVE', 
        reputationScore: 90, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm4', title: 'Smart Contract V1', description: 'Core vault logic with secure key management.', goal: 'Security audit pass', deliverable: 'Verified Contract', timeWindow: '4 Months', status: 'ACTIVE', fundRelease: 10000 },
          { id: 'm5', title: 'ZK Integration', description: 'Implement anonymous identity verification.', goal: 'Proof generation < 2s', deliverable: 'ZK Library', timeWindow: '6 Months', status: 'PENDING', fundRelease: 20000 }
        ], 
        updates: [
          { id: 'u3', timestamp: new Date().toISOString(), milestoneId: 'm4', summary: 'V1 Logic Finalized', done: 'Implemented multi-sig support and hardware wallet integration.', changed: 'Moved to Layer 2 for lower fees.', blocked: 'None', evidence: [] }
        ], 
        qa: [
          { id: 'q3', userId: 'u11', userName: 'Sanjay L.', question: 'Which blockchain are you using?', answer: 'We are targeting Polygon and Ethereum Mainnet.', timestamp: new Date().toISOString() }
        ], 
        auditHistory: [{ id: 'a3', action: 'PROJECT_START', timestamp: new Date().toISOString(), userId: 'user-tech-001', details: 'Project launched.' }], 
        incentives: [{ id: 'inc3', type: 'Public Credit', title: 'Security Partner', description: 'Mention in official security reports.', eligible: 'Skill', deliveryTiming: 'After Project', status: 'Upcoming' }], 
        hasIncentives: true, 
        problem: 'Data breaches and identity theft in centralized systems.', 
        solution: 'Decentralized PKI for user-owned authentication and data sharing.' 
      },
      { 
        id: 'proj-sustain-001', 
        creatorId: 'user-sustain-001', 
        creatorName: 'Ishani Patel', 
        title: 'Rainwater Harvesting Kit', 
        oneLineSummary: 'Affordable urban water conservation.', 
        category: 'Sustainability', 
        projectType: 'TECH_PRODUCT', 
        fundingGoal: 45000, 
        fundingRaised: 28000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'ishani@upi', 
        upiDisplayName: 'Ishani Sustain', 
        projectLinks: [], 
        contactEmail: 'ishani.patel@example.com', 
        duration: '12 Months', 
        financialBreakdown: [
          { id: 'f6', item: 'Material R&D', amount: 15000, description: 'Eco-friendly filter medium testing.', status: 'SPENT' },
          { id: 'f7', item: 'Tanks & Pipework', amount: 20000, description: 'Manufacturing initial 100 units.', status: 'ALLOCATED' },
          { id: 'f8', item: 'Logistics', amount: 10000, description: 'Storage and last-mile delivery.', status: 'ESTIMATED' }
        ], 
        skillsNeeded: ['Civil Engineering', 'Material Science'], 
        skillContributors: [
          { id: 'sc4', userId: 'u5', userName: 'Meera K.', skillCategory: 'Sustainability', specificSkill: 'Hydrology', level: 'Intermediate', contributionType: 'Advisory', commitment: '5h/week', duration: '3m', tasks: 'Filter design review.', output: 'Design Specs V2', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: false, availability: 'High', preferredCommunication: 'Email' }
        ], 
        status: 'ACTIVE', 
        reputationScore: 92, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'BI-WEEKLY', 
        milestones: [
          { id: 'm6', title: 'Filter Prototype', description: 'Multi-stage natural filtration system.', goal: 'Potable water certification', deliverable: 'Lab Certificate', timeWindow: '2 Months', status: 'COMPLETED', fundRelease: 8000 },
          { id: 'm7', title: 'Beta Testing', description: 'Install in 5 residential complexes.', goal: 'User feedback collection', deliverable: 'Survey Results', timeWindow: '3 Months', status: 'ACTIVE', fundRelease: 12000 }
        ], 
        updates: [
          { id: 'u4', timestamp: new Date().toISOString(), milestoneId: 'm6', summary: 'Certification Received', done: 'Water quality confirmed for non-drinking use.', changed: 'Using bamboo mesh for pre-filter.', blocked: 'None', evidence: ['https://example.com/lab-report'] }
        ], 
        qa: [
          { id: 'q4', userId: 'u12', userName: 'Amitabh R.', question: 'Can this be used for drinking water?', answer: 'Currently, it is optimized for domestic use (washing, gardening). An add-on UV stage is in development for drinking.', timestamp: new Date().toISOString() }
        ], 
        auditHistory: [{ id: 'a4', action: 'MILESTONE_COMPLETE', timestamp: new Date().toISOString(), userId: 'user-sustain-001', details: 'Filter Prototype verified.' }], 
        incentives: [{ id: 'inc4', type: 'Product', title: 'Early Adopter Kit', description: 'Discounted kit for contributors.', eligible: 'Both', deliveryTiming: 'After Project', status: 'Upcoming' }], 
        hasIncentives: true, 
        problem: 'Severe water scarcity in Indian metropolitan cities.', 
        solution: 'Low-cost, easy-to-install modular rooftop collection and bio-filtration.' 
      },
      { 
        id: 'proj-sustain-002', 
        creatorId: 'user-sustain-001', 
        creatorName: 'Ishani Patel', 
        title: 'Solar Powered Rickshaws', 
        oneLineSummary: 'Clean energy for public transport.', 
        category: 'Sustainability', 
        projectType: 'TECH_PRODUCT', 
        fundingGoal: 40000, 
        fundingRaised: 40000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'ishani2@upi', 
        upiDisplayName: 'Solar Wheels', 
        projectLinks: [], 
        contactEmail: 'ishani.patel@example.com', 
        duration: '6 Months', 
        financialBreakdown: [
          { id: 'f9', item: 'Solar Panels', amount: 15000, description: 'Flexible roof-integrated panels.', status: 'SPENT' },
          { id: 'f10', item: 'Battery Packs', amount: 15000, description: 'Swappable Li-ion units.', status: 'SPENT' },
          { id: 'f11', item: 'Motor Controller', amount: 10000, description: 'High-efficiency drive system.', status: 'SPENT' }
        ], 
        skillsNeeded: ['Electrical Engineering', 'AutoCAD'], 
        skillContributors: [
          { id: 'sc5', userId: 'u15', userName: 'Rajesh G.', skillCategory: 'Technology', specificSkill: 'Electric Powertrain', level: 'Advanced', contributionType: 'Ongoing', commitment: '20h/week', duration: '6m', tasks: 'Designing motor controller interface.', output: 'Controller PCB', status: 'COMPLETED', timestamp: new Date().toISOString(), isLearning: false, availability: 'Low', preferredCommunication: 'Call' }
        ], 
        status: 'COMPLETED', 
        reputationScore: 98, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm8', title: 'Drive Integration', description: 'Complete retrofit of 3 vehicles.', goal: 'Road worthiness', deliverable: 'Trial Logs', timeWindow: '3 Months', status: 'COMPLETED', fundRelease: 20000 },
          { id: 'm9', title: 'Efficiency Milestone', description: 'Optimize charge time under 4 hours.', goal: '3.5h charge time', deliverable: 'Efficiency Report', timeWindow: '2 Months', status: 'COMPLETED', fundRelease: 10000 }
        ], 
        updates: [
          { id: 'u5', timestamp: new Date().toISOString(), milestoneId: 'm8', summary: 'Road Trials Successful', done: '3 vehicles covered 500km each in traffic.', changed: 'Reinforced roof mounting.', blocked: 'None', evidence: [] }
        ], 
        qa: [], 
        auditHistory: [{ id: 'a5', action: 'PROJECT_CLOSED', timestamp: new Date().toISOString(), userId: 'user-sustain-001', details: 'Project successfully completed.' }], 
        incentives: [], 
        hasIncentives: false, 
        problem: 'Rising fuel costs and air pollution from traditional rickshaws.', 
        solution: 'Affordable solar retrofit kits with battery swapping capability.' 
      },
      { 
        id: 'proj-social-001', 
        creatorId: 'user-social-001', 
        creatorName: 'Vihaan Gupta', 
        title: 'Rural Micro-Lending Platform', 
        oneLineSummary: 'Peer-to-peer loans for rural artisans.', 
        category: 'Social Impact', 
        projectType: 'SOCIAL_IMPACT', 
        fundingGoal: 25000, 
        fundingRaised: 18500, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'vihaan@upi', 
        upiDisplayName: 'Vihaan Foundation', 
        projectLinks: [], 
        contactEmail: 'vihaan.gupta@example.com', 
        duration: '10 Months', 
        financialBreakdown: [
          { id: 'f12', item: 'Lending Pool', amount: 15000, description: 'Initial seed capital for loans.', status: 'ALLOCATED' },
          { id: 'f13', item: 'Platform Hosting', amount: 5000, description: 'Cloud servers for 1 year.', status: 'ALLOCATED' },
          { id: 'f14', item: 'On-ground Marketing', amount: 5000, description: 'Village outreach and onboarding.', status: 'ESTIMATED' }
        ], 
        skillsNeeded: ['FinTech', 'UI/UX', 'Field Operations'], 
        skillContributors: [
          { id: 'sc6', userId: 'u20', userName: 'Sunita B.', skillCategory: 'Social Impact', specificSkill: 'Community Management', level: 'Intermediate', contributionType: 'Ongoing', commitment: '10h/week', duration: '8m', tasks: 'Onboarding artisans and verifying identities.', output: '50 Artisans onboarded', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: false, availability: 'Medium', preferredCommunication: 'WhatsApp' }
        ], 
        status: 'ACTIVE', 
        reputationScore: 88, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm10', title: 'Beta MVP', description: 'Functional lending app for 1 district.', goal: '10 successful loans', deliverable: 'App Link', timeWindow: '4 Months', status: 'ACTIVE', fundRelease: 7000 },
          { id: 'm11', title: 'Scale-up Phase', description: 'Expand to 5 neighboring districts.', goal: '500 active users', deliverable: 'Impact Report', timeWindow: '6 Months', status: 'PENDING', fundRelease: 15000 }
        ], 
        updates: [
          { id: 'u6', timestamp: new Date().toISOString(), milestoneId: 'm10', summary: 'App Design Finalized', done: 'Completed UI/UX for low-bandwidth environments.', changed: 'Simplified login with OTP.', blocked: 'None', evidence: [] }
        ], 
        qa: [
          { id: 'q5', userId: 'u21', userName: 'Mohit K.', question: 'What is the interest rate?', answer: 'We facilitate zero-interest community loans with a small platform fee for maintenance.', timestamp: new Date().toISOString() }
        ], 
        auditHistory: [{ id: 'a6', action: 'PROJECT_START', timestamp: new Date().toISOString(), userId: 'user-social-001', details: 'Foundation work started.' }], 
        incentives: [{ id: 'inc5', type: 'Recognition', title: 'Social Impact Hero', description: 'Featured in our annual impact report.', eligible: 'Both', deliveryTiming: 'After Project', status: 'Upcoming' }], 
        hasIncentives: true, 
        problem: 'Rural artisans struggle with high-interest local money lenders.', 
        solution: 'A transparent, community-vouched peer-to-peer lending network.' 
      },
      { 
        id: 'proj-social-002', 
        creatorId: 'user-social-001', 
        creatorName: 'Vihaan Gupta', 
        title: 'Safe Water for Schools', 
        oneLineSummary: 'Filtration systems for village schools.', 
        category: 'Social Impact', 
        projectType: 'SOCIAL_IMPACT', 
        fundingGoal: 60000, 
        fundingRaised: 15000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'vihaan2@upi', 
        upiDisplayName: 'Safe Schools', 
        projectLinks: [], 
        contactEmail: 'vihaan.gupta@example.com', 
        duration: '18 Months', 
        financialBreakdown: [
          { id: 'f15', item: 'Bio-Sand Filters', amount: 30000, description: 'Bulk purchase of sustainable filters.', status: 'ESTIMATED' },
          { id: 'f16', item: 'Piping & Taps', amount: 15000, description: 'Installation costs per school.', status: 'ESTIMATED' },
          { id: 'f17', item: 'Sanitation Training', amount: 15000, description: 'Workshops for school staff.', status: 'ESTIMATED' }
        ], 
        skillsNeeded: ['Operations', 'Hydrology'], 
        skillContributors: [], 
        status: 'ACTIVE', 
        reputationScore: 85, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm12', title: 'Pilot School', description: 'Setup full system in one high-need school.', goal: '0% bacteria in output', deliverable: 'Test Results', timeWindow: '3 Months', status: 'PENDING', fundRelease: 5000 }
        ], 
        updates: [], 
        qa: [], 
        auditHistory: [], 
        incentives: [], 
        hasIncentives: false, 
        problem: 'High absenteeism in rural schools due to water-borne illnesses.', 
        solution: 'Deployment of sustainable, gravity-fed bio-sand filtration systems.' 
      },
      { 
        id: 'proj-arts-001', 
        creatorId: 'user-arts-001', 
        creatorName: 'Ananya Iyer', 
        title: 'VR Heritage Museum', 
        oneLineSummary: 'Immersive exploration of Indian forts.', 
        category: 'Arts', 
        projectType: 'CREATIVE', 
        fundingGoal: 30000, 
        fundingRaised: 8500, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'ananya@upi', 
        upiDisplayName: 'Ananya Arts', 
        projectLinks: [], 
        contactEmail: 'ananya.iyer@example.com', 
        duration: '6 Months', 
        financialBreakdown: [
          { id: 'f18', item: 'Scanning Gear', amount: 10000, description: 'Lidar scanner rental.', status: 'ALLOCATED' },
          { id: 'f19', item: '3D Artists', amount: 15000, description: 'Post-processing and cleanup.', status: 'ALLOCATED' },
          { id: 'f20', item: 'Hosting', amount: 5000, description: 'Cloud VR platform fees.', status: 'ESTIMATED' }
        ], 
        skillsNeeded: ['Unity/C#', '3D Modeling', 'Photogrammetry'], 
        skillContributors: [
          { id: 'sc7', userId: 'u25', userName: 'Vikram J.', skillCategory: 'Arts', specificSkill: '3D Artist', level: 'Advanced', contributionType: 'Ongoing', commitment: '15h/week', duration: '6m', tasks: 'Reconstructing fort interiors from scan data.', output: '3D Model Pack V1', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: false, availability: 'Medium', preferredCommunication: 'Email' }
        ], 
        status: 'ACTIVE', 
        reputationScore: 78, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm13', title: 'First Fort Scan', description: 'Complete 3D capture of Raigad Fort.', goal: '95% detail retention', deliverable: 'Point Cloud File', timeWindow: '2 Months', status: 'ACTIVE', fundRelease: 10000 }
        ], 
        updates: [
          { id: 'u7', timestamp: new Date().toISOString(), milestoneId: 'm13', summary: 'On-site Scanning Started', done: 'Completed lower ramparts scanning.', changed: 'Using drone for higher elevations.', blocked: 'Weather delays (fog).', evidence: [] }
        ], 
        qa: [], 
        auditHistory: [], 
        incentives: [{ id: 'inc6', type: 'Access', title: 'VR Early Access', description: 'Private beta access to VR experience.', eligible: 'Both', deliveryTiming: 'After Milestone', unlockedAtMilestoneId: 'm13', status: 'Upcoming' }], 
        hasIncentives: true, 
        problem: 'Historical monuments are deteriorating, and many are inaccessible to the physically challenged.', 
        solution: 'Creating high-fidelity, interactive VR tours of historical sites.' 
      },
      { 
        id: 'proj-arts-002', 
        creatorId: 'user-arts-001', 
        creatorName: 'Ananya Iyer', 
        title: 'Indie Musician Collective', 
        oneLineSummary: 'Shared studio for budding artists.', 
        category: 'Arts', 
        projectType: 'CREATIVE', 
        fundingGoal: 10000, 
        fundingRaised: 9000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'ananya2@upi', 
        upiDisplayName: 'Sound Hub', 
        projectLinks: [], 
        contactEmail: 'ananya.iyer@example.com', 
        duration: '3 Months', 
        financialBreakdown: [
          { id: 'f21', item: 'Audio Gear', amount: 6000, description: 'Mics, monitors, and interfaces.', status: 'SPENT' },
          { id: 'f22', item: 'Studio Build', amount: 4000, description: 'Acoustic treatment and furniture.', status: 'SPENT' }
        ], 
        skillsNeeded: ['Audio Engineering', 'Interior Design'], 
        skillContributors: [], 
        status: 'ACTIVE', 
        reputationScore: 82, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm14', title: 'Studio Launch', description: 'Full setup and opening for members.', goal: '10 active artists', deliverable: 'Studio Photos', timeWindow: '2 Months', status: 'COMPLETED', fundRelease: 5000 }
        ], 
        updates: [], 
        qa: [], 
        auditHistory: [], 
        incentives: [], 
        hasIncentives: false, 
        problem: 'Professional recording is unaffordable for most independent artists.', 
        solution: 'A membership-based community studio with professional gear.' 
      },
      { 
        id: 'proj-agri-001', 
        creatorId: 'user-agri-001', 
        creatorName: 'Arjun Reddy', 
        title: 'Smart Soil Health Sensor', 
        oneLineSummary: 'IoT device for real-time soil analysis.', 
        category: 'Agriculture', 
        projectType: 'TECH_PRODUCT', 
        fundingGoal: 40000, 
        fundingRaised: 22000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'arjun@upi', 
        upiDisplayName: 'Arjun Agri', 
        projectLinks: [], 
        contactEmail: 'arjun.reddy@example.com', 
        duration: '9 Months', 
        financialBreakdown: [
          { id: 'f23', item: 'Sensors R&D', amount: 15000, description: 'Calibration for different soil types.', status: 'ALLOCATED' },
          { id: 'f24', item: 'App Development', amount: 15000, description: 'Multi-lingual farmer dashboard.', status: 'ALLOCATED' },
          { id: 'f25', item: 'Pilot Batch', amount: 10000, description: '50 units for testing.', status: 'ESTIMATED' }
        ], 
        skillsNeeded: ['IoT', 'Data Science', 'Agronomy'], 
        skillContributors: [
          { id: 'sc8', userId: 'u30', userName: 'Dr. Ramesh P.', skillCategory: 'Sustainability', specificSkill: 'Soil Science', level: 'Advanced', contributionType: 'Advisory', commitment: '5h/week', duration: '9m', tasks: 'Validating sensor readings against lab tests.', output: 'Calibration Matrix', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: false, availability: 'Low', preferredCommunication: 'Email' }
        ], 
        status: 'ACTIVE', 
        reputationScore: 90, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm15', title: 'Lab Validation', description: 'Compare sensor with standard lab tests.', goal: '95% correlation', deliverable: 'Validation Report', timeWindow: '3 Months', status: 'ACTIVE', fundRelease: 8000 }
        ], 
        updates: [
          { id: 'u8', timestamp: new Date().toISOString(), milestoneId: 'm15', summary: 'Nitrogen Sensing Calibrated', done: 'Achieved 96% accuracy for NPK readings.', changed: 'Using new chemical probe.', blocked: 'None', evidence: [] }
        ], 
        qa: [], 
        auditHistory: [], 
        incentives: [{ id: 'inc7', type: 'Product', title: 'Beta Tester Unit', description: 'Free sensor for active contributors.', eligible: 'Skill', deliveryTiming: 'After Project', status: 'Upcoming' }], 
        hasIncentives: true, 
        problem: 'Improper fertilizer use leads to soil degradation and low yield.', 
        solution: 'Real-time soil nutrient monitoring via an affordable IoT probe.' 
      },
      { 
        id: 'proj-agri-002', 
        creatorId: 'user-agri-001', 
        creatorName: 'Arjun Reddy', 
        title: 'Farmer-to-Fork Logistics', 
        oneLineSummary: 'Bypassing middlemen in supply chain.', 
        category: 'Agriculture', 
        projectType: 'TECH_PRODUCT', 
        fundingGoal: 15000, 
        fundingRaised: 14500, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'arjun2@upi', 
        upiDisplayName: 'Direct Agri', 
        projectLinks: [], 
        contactEmail: 'arjun.reddy@example.com', 
        duration: '5 Months', 
        financialBreakdown: [
          { id: 'f26', item: 'Fleet Software', amount: 8000, description: 'Route optimization and driver app.', status: 'ALLOCATED' },
          { id: 'f27', item: 'Storage Hub', amount: 7000, description: 'Rent for 2 collection points.', status: 'ALLOCATED' }
        ], 
        skillsNeeded: ['Logistics', 'Mobile Dev'], 
        skillContributors: [], 
        status: 'ACTIVE', 
        reputationScore: 88, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm16', title: 'First 100 Deliveries', description: 'Test full chain from 10 farmers.', goal: 'Zero spoilage', deliverable: 'Logistics Logs', timeWindow: '2 Months', status: 'ACTIVE', fundRelease: 5000 }
        ], 
        updates: [], 
        qa: [], 
        auditHistory: [], 
        incentives: [], 
        hasIncentives: false, 
        problem: 'High wastage in supply chain and middlemen taking most profits.', 
        solution: 'Direct farmer-to-consumer logistics with real-time tracking.' 
      },
      { 
        id: 'proj-edu-001', 
        creatorId: 'user-edu-001', 
        creatorName: 'Saanvi Nair', 
        title: 'Vernacular AI Tutor', 
        oneLineSummary: 'AI learning in regional languages.', 
        category: 'Education', 
        projectType: 'TECH_PRODUCT', 
        fundingGoal: 50000, 
        fundingRaised: 35000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'saanvi@upi', 
        upiDisplayName: 'Saanvi Edu', 
        projectLinks: [], 
        contactEmail: 'saanvi.nair@example.com', 
        duration: '12 Months', 
        financialBreakdown: [
          { id: 'f28', item: 'GPU Training', amount: 20000, description: 'Fine-tuning Llama for Indic languages.', status: 'ALLOCATED' },
          { id: 'f29', item: 'Translation API', amount: 10000, description: 'Fallback translation services.', status: 'ALLOCATED' },
          { id: 'f30', item: 'Content Curation', amount: 20000, description: 'Adapting NCERT content.', status: 'ALLOCATED' }
        ], 
        skillsNeeded: ['NLP', 'Indic Languages Specialist', 'Curriculum Design'], 
        skillContributors: [
          { id: 'sc9', userId: 'u40', userName: 'Kiran M.', skillCategory: 'Technology', specificSkill: 'NLP Researcher', level: 'Advanced', contributionType: 'Ongoing', commitment: '10h/week', duration: '12m', tasks: 'Improving Malayalam and Tamil tokenization.', output: 'Indic-Llama V1', status: 'APPROVED', timestamp: new Date().toISOString(), isLearning: false, availability: 'Medium', preferredCommunication: 'Slack' }
        ], 
        status: 'ACTIVE', 
        reputationScore: 95, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'WEEKLY', 
        milestones: [
          { id: 'm17', title: 'Language Alpha', description: 'Support for Hindi, Marathi, and Tamil.', goal: 'Bilingual proficiency', deliverable: 'Chat Interface', timeWindow: '4 Months', status: 'ACTIVE', fundRelease: 12000 }
        ], 
        updates: [
          { id: 'u9', timestamp: new Date().toISOString(), milestoneId: 'm17', summary: 'Indic Dataset Ready', done: 'Collected 1M tokens of regional educational text.', changed: 'Added Marathi support earlier than planned.', blocked: 'None', evidence: [] }
        ], 
        qa: [], 
        auditHistory: [], 
        incentives: [{ id: 'inc8', type: 'Credit', title: 'Language Pioneer', description: 'Acknowledged as lead for a language.', eligible: 'Skill', deliveryTiming: 'After Project', status: 'Upcoming' }], 
        hasIncentives: true, 
        problem: 'Students in rural India struggle with English-only digital education tools.', 
        solution: 'Personalized AI tutor that speaks and teaches in regional languages.' 
      },
      { 
        id: 'proj-edu-002', 
        creatorId: 'user-edu-001', 
        creatorName: 'Saanvi Nair', 
        title: 'Open Science Lab Kits', 
        oneLineSummary: 'Portable kits for rural students.', 
        category: 'Education', 
        projectType: 'SOCIAL_IMPACT', 
        fundingGoal: 20000, 
        fundingRaised: 19000, 
        backerIds: [], 
        pendingAnchors: [], 
        upiId: 'saanvi2@upi', 
        upiDisplayName: 'Science Kits', 
        projectLinks: [], 
        contactEmail: 'saanvi.nair@example.com', 
        duration: '24 Months', 
        financialBreakdown: [
          { id: 'f31', item: 'Kit Components', amount: 12000, description: 'Bulk buying for 500 kits.', status: 'ALLOCATED' },
          { id: 'f32', item: 'Manual Printing', amount: 3000, description: 'Multi-lingual guidebooks.', status: 'ALLOCATED' },
          { id: 'f33', item: 'Workshop Travel', amount: 5000, description: 'Visiting remote schools.', status: 'ALLOCATED' }
        ], 
        skillsNeeded: ['Curriculum Dev', 'Manufacturing'], 
        skillContributors: [], 
        status: 'ACTIVE', 
        reputationScore: 92, 
        lastUpdate: new Date().toISOString(), 
        updateFrequency: 'MONTHLY', 
        milestones: [
          { id: 'm18', title: 'Batch 1 Production', description: 'Manufacture first 100 physics kits.', goal: '100% safety pass', deliverable: 'QC Report', timeWindow: '3 Months', status: 'PENDING', fundRelease: 6000 }
        ], 
        updates: [], 
        qa: [], 
        auditHistory: [], 
        incentives: [], 
        hasIncentives: false, 
        problem: 'Theoretical science teaching without practical experimentation.', 
        solution: 'Low-cost, sustainable experiment kits covering 6th-10th grade syllabus.' 
      }
    ];

    import path from "path";

const root = process.cwd();

// serve React build
app.use(express.static(path.join(root, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(root, "dist", "index.html"));
});
    await db.collection('projects').insertMany(dummyProjects);
    res.json({ success: true, users: 6, projects: 12 });
  } catch (error) {
    res.status(500).json({ error: 'Seed failed' });
  }
});
