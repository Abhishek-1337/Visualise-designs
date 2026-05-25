import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const seedData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const authReq = _req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;

    const existingContacts = await prisma.contact.count({ where: { tenantId } });
    if (existingContacts > 0) {
      res.status(400).json({ error: 'Tenant already has data. Delete existing data first or use /seed/force' });
      return;
    }

    const result = await seedTenantData(tenantId, authReq.user.id);
    res.status(201).json({ message: 'Seed data created successfully', data: result });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
};

export const forceSeedData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const authReq = _req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;

    await prisma.activity.deleteMany({ where: { tenantId } });
    await prisma.task.deleteMany({ where: { tenantId } });
    await prisma.project.deleteMany({ where: { tenantId } });
    await prisma.deal.deleteMany({ where: { tenantId } });
    await prisma.contact.deleteMany({ where: { tenantId } });

    const result = await seedTenantData(tenantId, authReq.user.id);
    res.status(201).json({ message: 'Seed data re-created successfully', data: result });
  } catch (error: any) {
    console.error('Force seed error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
};

async function seedTenantData(tenantId: string, adminUserId: string) {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@visualise.com' },
    update: {},
    create: {
      email: 'manager@visualise.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'MANAGER',
      tenantId,
      phone: '+1 (555) 111-2233',
      timezone: 'America/New_York',
    },
  });

  const emp1 = await prisma.user.upsert({
    where: { email: 'employee1@visualise.com' },
    update: {},
    create: {
      email: 'employee1@visualise.com',
      name: 'Alex Chen',
      password: hashedPassword,
      role: 'EMPLOYEE',
      tenantId,
      phone: '+1 (555) 222-3344',
      timezone: 'America/New_York',
    },
  });

  const emp2 = await prisma.user.upsert({
    where: { email: 'employee2@visualise.com' },
    update: {},
    create: {
      email: 'employee2@visualise.com',
      name: 'Maria Garcia',
      password: hashedPassword,
      role: 'EMPLOYEE',
      tenantId,
      phone: '+1 (555) 333-4455',
      timezone: 'America/Chicago',
    },
  });

  const emp3 = await prisma.user.upsert({
    where: { email: 'employee3@visualise.com' },
    update: {},
    create: {
      email: 'employee3@visualise.com',
      name: 'James Wilson',
      password: hashedPassword,
      role: 'EMPLOYEE',
      tenantId,
      phone: '+1 (555) 444-5566',
      timezone: 'America/Los_Angeles',
    },
  });

  const users = [adminUserId, manager.id, emp1.id, emp2.id, emp3.id];

  const contactsData = [
    { firstName: 'Alexandra', lastName: 'Morrison', email: 'alexandra@morrisoninteriors.com', phone: '+1 (555) 123-4567', company: 'Morrison Interiors', jobTitle: 'CEO', status: 'ACTIVE' as const, country: 'USA', value: 150000 },
    { firstName: 'David', lastName: 'Chen', email: 'david@chenassociates.com', phone: '+1 (555) 234-5678', company: 'Chen & Associates', jobTitle: 'Director', status: 'VIP' as const, country: 'USA', value: 250000 },
    { firstName: 'Priya', lastName: 'Sharma', email: 'priya@sharmadesign.com', phone: '+1 (555) 345-6789', company: 'Sharma Design Studio', jobTitle: 'Owner', status: 'ACTIVE' as const, country: 'USA', value: 180000 },
    { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus@johnsondev.com', phone: '+1 (555) 456-7890', company: 'Johnson Development', jobTitle: 'VP Development', status: 'ACTIVE' as const, country: 'USA', value: 320000 },
    { firstName: 'Elena', lastName: 'Vasquez', email: 'elena@vasquezarch.com', phone: '+1 (555) 567-8901', company: 'Vasquez Architecture', jobTitle: 'Principal Architect', status: 'VIP' as const, country: 'USA', value: 420000 },
    { firstName: 'Robert', lastName: 'Kim', email: 'robert@kimconstruction.com', phone: '+1 (555) 678-9012', company: 'Kim Construction', jobTitle: 'Project Manager', status: 'ACTIVE' as const, country: 'USA', value: 95000 },
    { firstName: 'Sarah', lastName: 'Williams', email: 'sarah@williamscreative.com', phone: '+1 (555) 789-0123', company: 'Williams Creative', jobTitle: 'Creative Director', status: 'INACTIVE' as const, country: 'USA', value: 75000 },
    { firstName: 'James', lastName: 'Rodriguez', email: 'james@rodriguezrealty.com', phone: '+1 (555) 890-1234', company: 'Rodriguez Realty', jobTitle: 'Broker', status: 'ACTIVE' as const, country: 'USA', value: 210000 },
    { firstName: 'Emily', lastName: 'Thompson', email: 'emily@thompsonco.com', phone: '+1 (555) 901-2345', company: 'Thompson & Co.', jobTitle: 'Managing Partner', status: 'PROSPECT' as const, country: 'USA', value: 60000 },
    { firstName: 'Michael', lastName: 'Park', email: 'michael@parkdev.com', phone: '+1 (555) 012-3456', company: 'Park Developments', jobTitle: 'CEO', status: 'ACTIVE' as const, country: 'USA', value: 280000 },
  ];

  const contacts = await Promise.all(
    contactsData.map((c, i) =>
      prisma.contact.create({
        data: {
          ...c,
          ownerId: users[i % users.length],
          tenantId,
          notes: i % 2 === 0 ? `Key client in the ${c.company} vertical. Prefers monthly check-ins.` : null,
          source: ['Referral', 'Website', 'Conference', 'LinkedIn', 'Cold Outreach'][i % 5],
        },
      })
    )
  );

  const dealsData = [
    { title: 'Website Redesign - Morrison Interiors', value: 45000, probability: 80, stage: 'NEGOTIATION' as const, status: 'OPEN' as const, contactIdx: 0, assignedIdx: 1, expectedClose: '2026-07-15' },
    { title: 'Brand Identity Package - Chen & Assoc', value: 25000, probability: 90, stage: 'CLOSED_WON' as const, status: 'WON' as const, contactIdx: 1, assignedIdx: 2, expectedClose: '2026-05-01' },
    { title: 'Mobile App MVP - Morrison Interiors', value: 80000, probability: 60, stage: 'PROPOSAL_SENT' as const, status: 'OPEN' as const, contactIdx: 0, assignedIdx: 3, expectedClose: '2026-08-30' },
    { title: 'Residential Villa Design - Sharma Design', value: 120000, probability: 75, stage: 'NEGOTIATION' as const, status: 'OPEN' as const, contactIdx: 2, assignedIdx: 0, expectedClose: '2026-09-01' },
    { title: 'Office Renovation - Chen & Assoc', value: 65000, probability: 85, stage: 'QUALIFIED' as const, status: 'OPEN' as const, contactIdx: 1, assignedIdx: 4, expectedClose: '2026-06-20' },
    { title: 'Commercial Tower Design - Vasquez Arch', value: 350000, probability: 40, stage: 'NEW_LEAD' as const, status: 'OPEN' as const, contactIdx: 4, assignedIdx: 0, expectedClose: '2026-12-15' },
    { title: 'Sunset Towers - Rodriguez Realty', value: 180000, probability: 55, stage: 'QUALIFIED' as const, status: 'OPEN' as const, contactIdx: 7, assignedIdx: 1, expectedClose: '2026-10-01' },
    { title: 'Park Plaza Hotel - Vasquez Arch', value: 280000, probability: 30, stage: 'NEW_LEAD' as const, status: 'OPEN' as const, contactIdx: 4, assignedIdx: 2, expectedClose: '2027-01-15' },
    { title: 'Lobby Art Installation - Chen & Assoc', value: 15000, probability: 95, stage: 'CLOSED_WON' as const, status: 'WON' as const, contactIdx: 1, assignedIdx: 3, expectedClose: '2026-04-15' },
    { title: 'Residential Complex - Johnson Development', value: 220000, probability: 45, stage: 'PROPOSAL_SENT' as const, status: 'OPEN' as const, contactIdx: 3, assignedIdx: 4, expectedClose: '2026-11-01' },
  ];

  const deals = await Promise.all(
    dealsData.map((d) =>
      prisma.deal.create({
        data: {
          title: d.title,
          value: d.value,
          probability: d.probability,
          stage: d.stage,
          status: d.status,
          expectedCloseDate: new Date(d.expectedClose),
          contactId: contacts[d.contactIdx].id,
          assignedToId: users[d.assignedIdx],
          tenantId,
        },
      })
    )
  );

  const projectsData = [
    { name: 'Website Redesign', description: 'Complete overhaul of the corporate website with modern UI/UX', status: 'ACTIVE' as const, progress: 65, budget: 45000, contactIdx: 0, memberIdxs: [1, 2, 3], startDate: '2026-02-01', endDate: '2026-07-30' },
    { name: 'Brand Identity Package', description: 'Logo, color palette, typography, and brand guidelines', status: 'COMPLETED' as const, progress: 100, budget: 25000, contactIdx: 1, memberIdxs: [2, 3], startDate: '2026-01-15', endDate: '2026-04-30' },
    { name: 'Mobile App MVP', description: 'Cross-platform mobile application for client portal', status: 'PLANNING' as const, progress: 15, budget: 80000, contactIdx: 0, memberIdxs: [1, 3, 4], startDate: '2026-04-01', endDate: '2026-09-30' },
    { name: 'Residential Villa Design', description: 'Modern villa design with sustainable materials', status: 'ACTIVE' as const, progress: 72, budget: 120000, contactIdx: 2, memberIdxs: [0, 2, 4], startDate: '2026-03-01', endDate: '2026-10-10' },
    { name: 'Office Renovation', description: 'Full interior redesign of downtown office space', status: 'ACTIVE' as const, progress: 45, budget: 65000, contactIdx: 1, memberIdxs: [1, 4], startDate: '2026-04-01', endDate: '2026-08-20' },
    { name: 'Commercial Tower', description: '40-story commercial tower architectural design', status: 'ACTIVE' as const, progress: 30, budget: 350000, contactIdx: 4, memberIdxs: [0, 2, 3], startDate: '2026-01-01', endDate: '2026-12-15' },
    { name: 'Sunset Towers', description: 'Luxury condominium complex with 3 towers', status: 'ACTIVE' as const, progress: 55, budget: 180000, contactIdx: 7, memberIdxs: [1, 3, 4], startDate: '2026-02-15', endDate: '2026-11-30' },
    { name: 'Park Plaza Hotel', description: 'Boutique hotel design with rooftop garden', status: 'PLANNING' as const, progress: 8, budget: 280000, contactIdx: 4, memberIdxs: [0, 2], startDate: '2026-05-01', endDate: '2027-03-31' },
  ];

  const projects = await Promise.all(
    projectsData.map((p) =>
      prisma.project.create({
        data: {
          name: p.name,
          description: p.description,
          status: p.status,
          progress: p.progress,
          budget: p.budget,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
          contactId: contacts[p.contactIdx].id,
          tenantId,
          members: {
            connect: p.memberIdxs.map((i) => ({ id: users[i] })),
          },
        },
      })
    )
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tasksData = [
    { title: 'Review homepage mockups', priority: 'HIGH' as const, status: 'IN_PROGRESS' as const, dueDate: new Date(today.getTime() + 1 * 86400000), contactIdx: 0, projectIdx: 0, assignedIdx: 1 },
    { title: 'Finalize color palette', priority: 'MEDIUM' as const, status: 'TODO' as const, dueDate: new Date(today.getTime() + 2 * 86400000), contactIdx: 1, projectIdx: 1, assignedIdx: 2 },
    { title: 'Prepare Q3 budget forecast', priority: 'HIGH' as const, status: 'TODO' as const, dueDate: new Date(today.getTime() + 3 * 86400000), contactIdx: null, projectIdx: null, assignedIdx: 0 },
    { title: 'Client presentation slides', priority: 'URGENT' as const, status: 'IN_PROGRESS' as const, dueDate: new Date(today.getTime() + 0.5 * 86400000), contactIdx: 2, projectIdx: 3, assignedIdx: 2 },
    { title: 'Site inspection report', priority: 'MEDIUM' as const, status: 'COMPLETED' as const, dueDate: new Date(today.getTime() - 1 * 86400000), contactIdx: 4, projectIdx: 5, assignedIdx: 0 },
    { title: 'Update project timeline', priority: 'HIGH' as const, status: 'IN_PROGRESS' as const, dueDate: new Date(today.getTime() + 5 * 86400000), contactIdx: 7, projectIdx: 6, assignedIdx: 1 },
    { title: 'Draft contract for new deal', priority: 'HIGH' as const, status: 'TODO' as const, dueDate: new Date(today.getTime() + 4 * 86400000), contactIdx: 3, projectIdx: null, assignedIdx: 0 },
    { title: 'Mobile app wireframes', priority: 'MEDIUM' as const, status: 'TODO' as const, dueDate: new Date(today.getTime() + 7 * 86400000), contactIdx: 0, projectIdx: 2, assignedIdx: 3 },
    { title: 'Team standup notes', priority: 'LOW' as const, status: 'COMPLETED' as const, dueDate: today, contactIdx: null, projectIdx: null, assignedIdx: 0 },
    { title: 'Review vendor proposals', priority: 'MEDIUM' as const, status: 'TODO' as const, dueDate: new Date(today.getTime() + 2 * 86400000), contactIdx: 4, projectIdx: 5, assignedIdx: 2 },
    { title: 'Interior material selections', priority: 'HIGH' as const, status: 'IN_PROGRESS' as const, dueDate: new Date(today.getTime() + 6 * 86400000), contactIdx: 2, projectIdx: 3, assignedIdx: 4 },
    { title: 'Structural engineering review', priority: 'URGENT' as const, status: 'TODO' as const, dueDate: new Date(today.getTime() + 1 * 86400000), contactIdx: 4, projectIdx: 5, assignedIdx: 0 },
  ];

  const tasks = await Promise.all(
    tasksData.map((t) =>
      prisma.task.create({
        data: {
          title: t.title,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
          contactId: t.contactIdx !== null ? contacts[t.contactIdx].id : null,
          projectId: t.projectIdx !== null ? projects[t.projectIdx].id : null,
          assignedToId: users[t.assignedIdx],
          createdById: adminUserId,
          tenantId,
        },
      })
    )
  );

  const activitiesData = [
    { type: 'deal_created', description: 'New deal: Website Redesign - Morrison Interiors', dealIdx: 0, contactIdx: 0, userIdx: 0 },
    { type: 'deal_stage_changed', description: 'Deal moved to NEGOTIATION: Website Redesign', dealIdx: 0, contactIdx: 0, userIdx: 1 },
    { type: 'deal_created', description: 'Deal won: Brand Identity Package - Chen & Assoc', dealIdx: 1, contactIdx: 1, userIdx: 2 },
    { type: 'contact_created', description: 'New contact created: Alexandra Morrison', dealIdx: null, contactIdx: 0, userIdx: 0 },
    { type: 'contact_created', description: 'New contact created: David Chen', dealIdx: null, contactIdx: 1, userIdx: 0 },
    { type: 'project_created', description: 'New project: Website Redesign', dealIdx: null, contactIdx: 0, userIdx: 0, projectIdx: 0 },
    { type: 'project_created', description: 'New project: Commercial Tower', dealIdx: null, contactIdx: 4, userIdx: 0, projectIdx: 5 },
    { type: 'task_completed', description: 'Task completed: Site inspection report', dealIdx: null, contactIdx: 4, userIdx: 0, projectIdx: 5 },
    { type: 'task_created', description: 'New task: Review homepage mockups', dealIdx: null, contactIdx: 0, userIdx: 1, projectIdx: 0 },
    { type: 'task_created', description: 'New task: Client presentation slides', dealIdx: null, contactIdx: 2, userIdx: 2, projectIdx: 3 },
    { type: 'project_updated', description: 'Project progress updated: Residential Villa Design - 72%', dealIdx: null, contactIdx: 2, userIdx: 4, projectIdx: 3 },
    { type: 'contact_created', description: 'New contact created: Elena Vasquez', dealIdx: null, contactIdx: 4, userIdx: 0 },
    { type: 'deal_created', description: 'New deal: Commercial Tower Design - Vasquez Arch', dealIdx: 5, contactIdx: 4, userIdx: 0 },
    { type: 'project_created', description: 'New project: Sunset Towers', dealIdx: null, contactIdx: 7, userIdx: 0, projectIdx: 6 },
    { type: 'deal_stage_changed', description: 'Deal moved to QUALIFIED: Office Renovation', dealIdx: 4, contactIdx: 1, userIdx: 4 },
  ];

  await Promise.all(
    activitiesData.map((a) =>
      prisma.activity.create({
        data: {
          type: a.type,
          description: a.description,
          userId: users[a.userIdx],
          contactId: a.contactIdx !== null ? contacts[a.contactIdx].id : null,
          dealId: a.dealIdx !== null ? deals[a.dealIdx].id : null,
          projectId: (a as any).projectIdx !== undefined && (a as any).projectIdx !== null ? projects[(a as any).projectIdx].id : null,
          tenantId,
        },
      })
    )
  );

  return {
    users: { admin: adminUserId, manager: manager.id, employees: [emp1.id, emp2.id, emp3.id] },
    contacts: contacts.length,
    deals: deals.length,
    projects: projects.length,
    tasks: tasks.length,
    activities: activitiesData.length,
  };
}
