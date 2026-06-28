import { prisma } from './prisma.ts';
import { winstonLogger } from '../utils/logger.ts';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    winstonLogger.warn('⚠️ Skipping database seeding: DATABASE_URL is not set.');
    return;
  }

  try {
    winstonLogger.info('🌱 Starting database seeding and initialization via Prisma...');

    // 1. Seed Departments
    const defaultDepts = [
      { id: 'dept-1', name: 'Roads' },
      { id: 'dept-2', name: 'Electrical' },
      { id: 'dept-3', name: 'Sanitation' },
      { id: 'dept-4', name: 'Parks & Rec' },
      { id: 'dept-5', name: 'Water Resources' },
    ];

    for (const dept of defaultDepts) {
      await prisma.department.upsert({
        where: { id: dept.id },
        update: { name: dept.name },
        create: dept,
      });
    }
    winstonLogger.info('✅ Departments seeded successfully.');

    // 2. Seed Predictions (Hotspots)
    const seedPredictions = [
      { id: 'p-1', areaName: 'Sector 4 (Downtown Grid)', riskScore: 88.5, predictedIssue: 'Pothole density build-up' },
      { id: 'p-2', areaName: 'Sector 12 (Waterfront Area)', riskScore: 74.2, predictedIssue: 'Drainage blocks & flood risk' },
      { id: 'p-3', areaName: 'Sector 7 (Eastside Crossing)', riskScore: 61.8, predictedIssue: 'Streetlight outages' },
    ];

    for (const pred of seedPredictions) {
      await prisma.prediction.upsert({
        where: { id: pred.id },
        update: {
          areaName: pred.areaName,
          riskScore: pred.riskScore,
          predictedIssue: pred.predictedIssue,
        },
        create: pred,
      });
    }
    winstonLogger.info('✅ Predictive Hotspots seeded successfully.');

    // 3. Seed Initial System Logs
    const initialLogs = [
      { id: 'l-init-1', text: '[SYS] CivicLens AI Unified Express Engine initialized', type: 'SYS', timestamp: new Date().toLocaleTimeString() },
      { id: 'l-init-2', text: '[DB] Prisma Client connected and schema synchronized with database', type: 'DB', timestamp: new Date().toLocaleTimeString() },
    ];

    for (const log of initialLogs) {
      await prisma.systemLog.upsert({
        where: { id: log.id },
        update: {
          text: log.text,
          type: log.type,
          timestamp: log.timestamp,
        },
        create: log,
      });
    }
    winstonLogger.info('✅ System logs initialized.');

    // 4. Seed Users (Citizens 1-8, Officials 1-8, Admin)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);
    const joinedAtStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const seedUsers = [
      { uid: 'u-admin', email: 'admin@civiclens.ai', name: 'Administrator', role: 'ADMIN' },
      ...Array.from({ length: 8 }, (_, i) => ({
        uid: `u-citizen-${i + 1}`,
        email: `citizen${i + 1}@civiclens.ai`,
        name: `Citizen ${i + 1}`,
        role: 'CITIZEN',
      })),
      ...Array.from({ length: 8 }, (_, i) => ({
        uid: `u-official-${i + 1}`,
        email: `official${i + 1}@civiclens.ai`,
        name: `Official ${i + 1}`,
        role: 'OFFICIAL',
      })),
    ];

    for (const u of seedUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          role: u.role,
          passwordHash: passwordHash,
        },
        create: {
          uid: u.uid,
          email: u.email,
          name: u.name,
          role: u.role,
          points: 100,
          joinedAt: joinedAtStr,
          avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
          passwordHash: passwordHash,
        },
      });
    }
    winstonLogger.info('✅ Seed users initialized.');

    // 5. Seed Initial Complaints & Timeline items (associated with citizen1)
    const seedComplaints = [
      {
        id: 'ID-12345',
        title: 'Severe Pothole on Main St.',
        description: 'A deep, jagged pothole in the middle of Main St. causing drivers to swerve into oncoming traffic. Needs immediate patching before it causes a major collision.',
        category: 'Road Damage',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        assignedDept: 'Roads',
        reportedBy: 'Anonymous User',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDaVpNi77bOUVar8h8uJa_Yn_wIfswyOVgkrPryfJCAQDY7B_Xm1hdIjH7zKXJfcOy28AC3JBvJvuyMMa0vj4cWvLmtJ59EVRK_8z6eR1LozUYcgnkdjeWzBvVeos7JdLx1z62pA2niH4roTnK2WB9zAyuTPSZdbgENzfzS1PyeaaaD286yHoT-bkJwVqmzGx7Jjd0Lo4pu9QeZJ0lhASNETwMIMtHYxVR4QtTRxWLudFaeqsLVvZ3ncglRiXrhPGKKgSFBspsUKY',
        locationName: '1200 Main St. Intersection',
        latitude: 40.7128,
        longitude: -74.0060,
        upvotes: 24,
        timeline: [
          { id: 't1-1', status: 'In Progress', description: 'Maintenance crew dispatched to location.', timestamp: 'Today, 09:15 AM', isCurrent: true },
          { id: 't1-2', status: 'Assigned to Roads Dept', description: 'Ticket #R-8842 generated and queued.', timestamp: 'Oct 25, 2023, 11:30 AM', isCurrent: false },
          { id: 't1-3', status: 'Verified by Community', description: '12 citizens confirmed this issue.', timestamp: 'Oct 24, 2023, 05:00 PM', isCurrent: false },
          { id: 't1-4', status: 'Report Submitted', description: 'Initial report filed via mobile app.', timestamp: 'Oct 24, 2023, 08:45 AM', isCurrent: false }
        ]
      },
      {
        id: 'REQ-8892',
        title: 'Severe Pothole',
        description: 'Extremely deep road cavity near the crosswalk. Posing a severe hazard to cyclists and passing vehicles.',
        category: 'Road Surface Damage',
        severity: 'CRITICAL',
        status: 'PENDING',
        assignedDept: 'Roads',
        reportedBy: 'Jane Doe',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsgDW22ZGl_AbFifHWFJbpP-wWVtj6uQEGFLju369rByM3Zee3z6QkmdHeDvKNrGpVIvcgL421AynDo1mAx93H2AqGyEjYjvL9FicFvNUKk09na4qcgmfmz_kDG3IcVDnHw6uBXbfDXxJKqbWxqdUthzHOn9lbYJQFdk60V_QzYumlpb1yfFNLmW-PQRPUXCDA7FZL8V65_s_fTPCfIPZzbYdlsysLci3YWGJrLuI7VspCO6VmhV5PDmWLZLiT7jB4cU8TT-XCTWg',
        locationName: '400 Block, Main St.',
        latitude: 40.7132,
        longitude: -74.0080,
        upvotes: 45,
        timeline: [
          { id: 't2-1', status: 'Pending Action', description: 'Report verified. Awaiting dispatcher scheduling.', timestamp: 'Oct 24, 2023, 10:00 AM', isCurrent: true },
          { id: 't2-2', status: 'Report Submitted', description: 'Initial report filed via mobile app.', timestamp: 'Oct 24, 2023, 08:45 AM', isCurrent: false }
        ]
      },
      {
        id: 'REQ-8891',
        title: 'Streetlight Out',
        description: 'Streetlight completely dark at the intersection of Elm and 5th. Commuters are complaining about low visibility.',
        category: 'Traffic Signal Failure',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        assignedDept: 'Electrical',
        reportedBy: 'John Smith',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCamFoiSVYKSltqMpkNCGI3ayxhr9spaStvt69S1B7bXOyxn0fc63UxzVw8RAZTXad44hfU1MzPXTjU0fsGRohY_cpIKVpHGVcjiG7v3aIO3YS7KD2BOSFmceS-Y1pVWLzPk0v6ENam7h6Q_HA6dq5kPhmGy2WrX0N4UHP-aVTfEJMmnG37uBi1RSvqLg-FNuy3BfKm64RxxQTmXE_Yuwn4Bf_6gp6N8utPckAwiQ0OMjCzeprFGmSAnj87ublHan8Qd-1B4VmKM-o',
        locationName: 'Elm & 5th Ave',
        latitude: 40.7150,
        longitude: -74.0030,
        upvotes: 12,
        timeline: [
          { id: 't3-1', status: 'In Progress', description: 'Technician dispatched to inspect bulb and local wiring.', timestamp: 'Oct 24, 2023, 11:30 AM', isCurrent: true },
          { id: 't3-2', status: 'Report Submitted', description: 'Reported by local resident.', timestamp: 'Oct 24, 2023, 05:00 AM', isCurrent: false }
        ]
      },
      {
        id: 'REQ-8885',
        title: 'Graffiti on Wall',
        description: 'Bright spray-painted tags along the Centennial Park North retaining wall facing the main walkway.',
        category: 'Street Lighting Outage',
        severity: 'LOW',
        status: 'SCHEDULED',
        assignedDept: 'Parks & Rec',
        reportedBy: 'Marcus Vance',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcQe7iDbBBzfUQotGw9gAq1IwYAo0m6iLxqQ_nRkozskpEbSClVKoBOZDM3hnPNjsV0pztKLK8RwPHFM2HLGSmw7i2kOH8VXTVmY9eYoxlcIY_WhSgD5zgBgHFIncYB3hnFEhMroM6v39oExiav7ys3gdY9VDFa7vxkXmPnX-XImEPx1l_V7zIwnyPdI6XBIOJFuXQuQfrx8jZs_QNcmEzjo0wrDnncrIB4YOx4o59o0SUDTi07aHHKqAMUUvHjY6eIdoY_OfzMPY',
        locationName: 'Centennial Park North',
        latitude: 40.7180,
        longitude: -74.0090,
        upvotes: 8,
        timeline: [
          { id: 't4-1', status: 'Scheduled', description: 'Graffiti cleaning crew scheduled for Friday morning.', timestamp: 'Oct 25, 2023, 09:00 AM', isCurrent: true },
          { id: 't4-2', status: 'Report Submitted', description: 'Initial report filed.', timestamp: 'Oct 24, 2023, 01:20 PM', isCurrent: false }
        ]
      },
      {
        id: 'REQ-8880',
        title: 'Illegal Dumping',
        description: 'A large pile of construction waste, drywall, and broken bricks discarded on the sidewalk next to the warehouse.',
        category: 'Illegal Dumping',
        severity: 'MEDIUM',
        status: 'RESOLVED',
        assignedDept: 'Sanitation',
        reportedBy: 'Anonymous User',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbssRHcw1xDZY8gOICQivNTqjBl-ljR4_64XATmuTyu2CRMWnQ6YqxukZOV5soKBe_1HlQFVCHAWT55i7MrtP-DzwVxGRLNPv6dMhVGxpFHI9HXF0J5vA1M-wgj6A8aG82hBUnXXUNp5bgQCVL1hggq_qntKKV8f2Q8JM43_yJqYsQFtFBjZv_sGYhk6bQecfsZjIfQ41NPusBmEs2SNW1U_LJmhvIiPeQnMXwtJ9a3kMtj89jE8sHkTo9Mw0ctjP3q9PbQRacHMA',
        locationName: 'Eastside Commercial',
        latitude: 40.7110,
        longitude: -74.0010,
        upvotes: 18,
        timeline: [
          { id: 't5-1', status: 'Resolved', description: 'Sanitation waste removal completed.', timestamp: 'Oct 25, 2023, 04:30 PM', isCurrent: true },
          { id: 't5-2', status: 'Report Submitted', description: 'Reported via mobile photo.', timestamp: 'Oct 24, 2023, 08:45 AM', isCurrent: false }
        ]
      }
    ];

    for (const c of seedComplaints) {
      await prisma.complaint.upsert({
        where: { id: c.id },
        update: {
          title: c.title,
          description: c.description,
          category: c.category,
          severity: c.severity,
          status: c.status,
          assignedDept: c.assignedDept,
          reportedBy: c.reportedBy,
          imageUrl: c.imageUrl,
          locationName: c.locationName,
          latitude: c.latitude,
          longitude: c.longitude,
          upvotes: c.upvotes,
        },
        create: {
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          severity: c.severity,
          status: c.status,
          assignedDept: c.assignedDept,
          reportedBy: c.reportedBy,
          citizenId: 'u-citizen-1', // Link to citizen1
          imageUrl: c.imageUrl,
          locationName: c.locationName,
          latitude: c.latitude,
          longitude: c.longitude,
          upvotes: c.upvotes,
          aiConfidence: 0.85,
        },
      });

      // Seed timeline items
      for (const t of c.timeline) {
        await prisma.timelineItem.upsert({
          where: { id: t.id },
          update: {
            status: t.status,
            description: t.description,
            timestamp: t.timestamp,
            isCurrent: t.isCurrent,
          },
          create: {
            id: t.id,
            complaintId: c.id,
            status: t.status,
            description: t.description,
            timestamp: t.timestamp,
            isCurrent: t.isCurrent,
          },
        });
      }
    }
    winstonLogger.info('✅ Seed complaints & timelines initialized successfully.');
    winstonLogger.info('🎉 Database seeding completed successfully.');
  } catch (error) {
    winstonLogger.error('❌ Failed to seed database:', error);
  }
}

// Auto-run seeding if executed directly via tsx / node command line
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('seed.ts') || 
  process.argv[1].endsWith('seed')
);
if (isDirectRun) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Fatal Seeding Failure:', err);
    process.exit(1);
  });
}

