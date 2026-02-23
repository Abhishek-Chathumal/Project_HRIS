import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Create Permissions ──────────────────
  const resources = [
    'employees',
    'attendance',
    'leave',
    'payroll',
    'recruitment',
    'performance',
    'training',
    'policies',
    'audit',
    'settings',
  ];
  const actions = ['create', 'read', 'update', 'delete'];

  const permissions: { id: string; resource: string; action: string }[] = [];
  for (const resource of resources) {
    for (const action of actions) {
      const perm = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action, description: `${action} ${resource}` },
      });
      permissions.push(perm);
    }
  }

  console.log(`  ✅ ${permissions.length} permissions created`);

  // ── Create Roles ────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'System Administrator',
      description: 'Full system access',
      isSystem: true,
    },
  });

  const hrManagerRole = await prisma.role.upsert({
    where: { name: 'hr_manager' },
    update: {},
    create: {
      name: 'hr_manager',
      displayName: 'HR Manager',
      description: 'HR department management access',
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      displayName: 'Manager',
      description: 'Team management access',
      isSystem: true,
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      displayName: 'Employee',
      description: 'Standard employee access',
      isSystem: true,
    },
  });

  console.log('  ✅ Roles created: admin, hr_manager, manager, employee');

  // ── Assign permissions to roles ─────────
  // Admin gets all permissions
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // HR Manager gets most permissions (except settings delete)
  const hrPermissions = permissions.filter(
    (p) => !(p.resource === 'settings' && p.action === 'delete'),
  );
  for (const perm of hrPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: hrManagerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: hrManagerRole.id, permissionId: perm.id },
    });
  }

  // Employee gets read access + limited create
  const employeePermissions = permissions.filter(
    (p) =>
      p.action === 'read' ||
      (p.resource === 'leave' && p.action === 'create') ||
      (p.resource === 'attendance' && p.action === 'create'),
  );
  for (const perm of employeePermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: employeeRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: employeeRole.id, permissionId: perm.id },
    });
  }

  console.log('  ✅ Role permissions assigned');

  // ── Create Organization ─────────────────
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'HRIS Demo Corp',
      legalName: 'HRIS Demo Corporation Ltd.',
      industry: 'Technology',
      website: 'https://hris-demo.com',
      timezone: 'UTC',
      currency: 'USD',
      locale: 'en',
      fiscalYearStart: 1,
    },
  });

  console.log(`  ✅ Organization created: ${org.name}`);

  // ── Create Departments ──────────────────
  const deptData = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Human Resources', code: 'HRD' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Marketing', code: 'MKT' },
    { name: 'Operations', code: 'OPS' },
    { name: 'Sales', code: 'SLS' },
  ];

  const departments: Record<string, { id: string }> = {};
  for (const d of deptData) {
    const dept = await prisma.department.create({
      data: {
        organizationId: org.id,
        name: d.name,
        code: d.code,
      },
    });
    departments[d.name] = dept;
  }

  console.log(`  ✅ ${deptData.length} departments created`);

  // ── Create Positions ────────────────────
  const posData = [
    { title: 'Chief Executive Officer', code: 'CEO', dept: 'Operations', level: 'C-Level' },
    { title: 'VP of Engineering', code: 'VPE', dept: 'Engineering', level: 'Director' },
    { title: 'HR Director', code: 'HRD', dept: 'Human Resources', level: 'Director' },
    { title: 'Finance Director', code: 'FND', dept: 'Finance', level: 'Director' },
    { title: 'Marketing Director', code: 'MKD', dept: 'Marketing', level: 'Director' },
    { title: 'Sales Director', code: 'SLD', dept: 'Sales', level: 'Director' },
    { title: 'Engineering Manager', code: 'ENM', dept: 'Engineering', level: 'Manager' },
    { title: 'Senior Software Engineer', code: 'SSE', dept: 'Engineering', level: 'Senior' },
    { title: 'Software Engineer', code: 'SWE', dept: 'Engineering', level: 'Mid' },
    { title: 'Junior Developer', code: 'JDE', dept: 'Engineering', level: 'Junior' },
    { title: 'QA Engineer', code: 'QAE', dept: 'Engineering', level: 'Mid' },
    { title: 'DevOps Engineer', code: 'DOE', dept: 'Engineering', level: 'Senior' },
    { title: 'HR Manager', code: 'HRM', dept: 'Human Resources', level: 'Manager' },
    { title: 'HR Specialist', code: 'HRS', dept: 'Human Resources', level: 'Mid' },
    { title: 'Recruiter', code: 'RCR', dept: 'Human Resources', level: 'Mid' },
    { title: 'Financial Analyst', code: 'FNA', dept: 'Finance', level: 'Mid' },
    { title: 'Accountant', code: 'ACC', dept: 'Finance', level: 'Mid' },
    { title: 'Marketing Manager', code: 'MKM', dept: 'Marketing', level: 'Manager' },
    { title: 'Marketing Analyst', code: 'MKA', dept: 'Marketing', level: 'Mid' },
    { title: 'Content Strategist', code: 'CST', dept: 'Marketing', level: 'Mid' },
    { title: 'Operations Manager', code: 'OPM', dept: 'Operations', level: 'Manager' },
    { title: 'Operations Analyst', code: 'OPA', dept: 'Operations', level: 'Mid' },
    { title: 'Sales Manager', code: 'SLM', dept: 'Sales', level: 'Manager' },
    { title: 'Sales Executive', code: 'SLE', dept: 'Sales', level: 'Mid' },
    { title: 'Account Manager', code: 'ACM', dept: 'Sales', level: 'Mid' },
  ];

  const positions: Record<string, { id: string }> = {};
  for (const p of posData) {
    const pos = await prisma.position.create({
      data: {
        title: p.title,
        code: p.code,
        departmentId: departments[p.dept].id,
        level: p.level,
      },
    });
    positions[p.code] = pos;
  }

  console.log(`  ✅ ${posData.length} positions created`);

  // ── Helper: Create Employee ──────────────
  const passwordHash = await bcrypt.hash('Demo@2026!', 12);

  async function createEmployee(data: {
    number: string;
    firstName: string;
    lastName: string;
    email: string;
    dept: string;
    posCode: string;
    type: string;
    status: string;
    joined: string;
    gender?: string;
    dob?: string;
    phone?: string;
    roleName?: string;
  }) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        passwordHash,
        isActive: true,
        isEmailVerified: true,
      },
    });

    const role =
      data.roleName === 'admin'
        ? adminRole
        : data.roleName === 'hr_manager'
          ? hrManagerRole
          : data.roleName === 'manager'
            ? managerRole
            : employeeRole;

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    const emp = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeNumber: data.number,
        firstName: data.firstName,
        lastName: data.lastName,
        departmentId: departments[data.dept].id,
        positionId: positions[data.posCode].id,
        employmentType: data.type,
        employmentStatus: data.status,
        joiningDate: new Date(data.joined),
        gender: data.gender,
        dateOfBirth: data.dob ? new Date(data.dob) : undefined,
        workPhone: data.phone,
        personalEmail: data.email,
      },
    });

    return emp;
  }

  // ── Create Employees ─────────────────────

  // 1. CEO / Admin
  const ceo = await createEmployee({
    number: 'EMP-001',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'admin@hris-demo.com',
    dept: 'Operations',
    posCode: 'CEO',
    type: 'full-time',
    status: 'active',
    joined: '2020-01-15',
    gender: 'male',
    dob: '1975-06-12',
    phone: '+1-555-0101',
    roleName: 'admin',
  });

  // 2. VP Engineering
  const vpEng = await createEmployee({
    number: 'EMP-002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@hris-demo.com',
    dept: 'Engineering',
    posCode: 'VPE',
    type: 'full-time',
    status: 'active',
    joined: '2021-03-01',
    gender: 'female',
    dob: '1982-09-24',
    phone: '+1-555-0102',
    roleName: 'manager',
  });

  // 3. HR Director
  const hrDir = await createEmployee({
    number: 'EMP-003',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@hris-demo.com',
    dept: 'Human Resources',
    posCode: 'HRD',
    type: 'full-time',
    status: 'active',
    joined: '2021-06-15',
    gender: 'female',
    dob: '1980-03-18',
    phone: '+1-555-0103',
    roleName: 'hr_manager',
  });

  // 4. Finance Director
  await createEmployee({
    number: 'EMP-004',
    firstName: 'James',
    lastName: 'Williams',
    email: 'james.w@hris-demo.com',
    dept: 'Finance',
    posCode: 'FND',
    type: 'full-time',
    status: 'active',
    joined: '2021-08-01',
    gender: 'male',
    dob: '1978-11-05',
    phone: '+1-555-0104',
    roleName: 'manager',
  });

  // 5. Marketing Director
  await createEmployee({
    number: 'EMP-005',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@hris-demo.com',
    dept: 'Marketing',
    posCode: 'MKD',
    type: 'full-time',
    status: 'active',
    joined: '2022-01-10',
    gender: 'female',
    dob: '1985-07-22',
    phone: '+1-555-0105',
    roleName: 'manager',
  });

  // 6. Sales Director
  await createEmployee({
    number: 'EMP-006',
    firstName: 'Michael',
    lastName: 'Kim',
    email: 'michael.k@hris-demo.com',
    dept: 'Sales',
    posCode: 'SLD',
    type: 'full-time',
    status: 'active',
    joined: '2022-03-15',
    gender: 'male',
    dob: '1983-02-14',
    phone: '+1-555-0106',
    roleName: 'manager',
  });

  // 7. Engineering Manager
  await createEmployee({
    number: 'EMP-007',
    firstName: 'Alex',
    lastName: 'Nakamura',
    email: 'alex.n@hris-demo.com',
    dept: 'Engineering',
    posCode: 'ENM',
    type: 'full-time',
    status: 'active',
    joined: '2022-05-01',
    gender: 'male',
    dob: '1988-04-30',
    phone: '+1-555-0107',
    roleName: 'manager',
  });

  // 8–11: Senior Engineers
  await createEmployee({
    number: 'EMP-008',
    firstName: 'Olivia',
    lastName: 'Martinez',
    email: 'olivia.m@hris-demo.com',
    dept: 'Engineering',
    posCode: 'SSE',
    type: 'full-time',
    status: 'active',
    joined: '2022-09-15',
    gender: 'female',
    dob: '1990-12-08',
    phone: '+1-555-0108',
  });

  await createEmployee({
    number: 'EMP-009',
    firstName: 'Daniel',
    lastName: 'Lee',
    email: 'daniel.l@hris-demo.com',
    dept: 'Engineering',
    posCode: 'SSE',
    type: 'full-time',
    status: 'active',
    joined: '2023-01-10',
    gender: 'male',
    dob: '1991-05-16',
  });

  await createEmployee({
    number: 'EMP-010',
    firstName: 'Aisha',
    lastName: 'Patel',
    email: 'aisha.p@hris-demo.com',
    dept: 'Engineering',
    posCode: 'SWE',
    type: 'full-time',
    status: 'active',
    joined: '2023-04-01',
    gender: 'female',
    dob: '1994-08-22',
  });

  await createEmployee({
    number: 'EMP-011',
    firstName: 'Lucas',
    lastName: 'Weber',
    email: 'lucas.w@hris-demo.com',
    dept: 'Engineering',
    posCode: 'SWE',
    type: 'full-time',
    status: 'active',
    joined: '2023-07-15',
    gender: 'male',
    dob: '1993-01-28',
  });

  // 12. DevOps Engineer
  await createEmployee({
    number: 'EMP-012',
    firstName: 'Fatima',
    lastName: 'Hassan',
    email: 'fatima.h@hris-demo.com',
    dept: 'Engineering',
    posCode: 'DOE',
    type: 'full-time',
    status: 'active',
    joined: '2023-02-01',
    gender: 'female',
    dob: '1992-06-10',
  });

  // 13. QA Engineer (contract)
  await createEmployee({
    number: 'EMP-013',
    firstName: 'David',
    lastName: 'Okoye',
    email: 'david.o@hris-demo.com',
    dept: 'Engineering',
    posCode: 'QAE',
    type: 'contract',
    status: 'active',
    joined: '2024-01-15',
    gender: 'male',
    dob: '1995-09-03',
  });

  // 14. Junior Developer (probation)
  await createEmployee({
    number: 'EMP-014',
    firstName: 'Sophie',
    lastName: 'Dubois',
    email: 'sophie.d@hris-demo.com',
    dept: 'Engineering',
    posCode: 'JDE',
    type: 'full-time',
    status: 'probation',
    joined: '2025-11-01',
    gender: 'female',
    dob: '2000-03-25',
  });

  // 15. Junior Developer (probation)
  await createEmployee({
    number: 'EMP-015',
    firstName: 'Ryan',
    lastName: 'Thompson',
    email: 'ryan.t@hris-demo.com',
    dept: 'Engineering',
    posCode: 'JDE',
    type: 'full-time',
    status: 'probation',
    joined: '2025-12-15',
    gender: 'male',
    dob: '2001-07-11',
  });

  // 16. HR Manager
  await createEmployee({
    number: 'EMP-016',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g@hris-demo.com',
    dept: 'Human Resources',
    posCode: 'HRM',
    type: 'full-time',
    status: 'active',
    joined: '2022-04-01',
    gender: 'female',
    dob: '1987-10-15',
    phone: '+1-555-0116',
    roleName: 'hr_manager',
  });

  // 17. Recruiter
  await createEmployee({
    number: 'EMP-017',
    firstName: 'Kevin',
    lastName: 'Brown',
    email: 'kevin.b@hris-demo.com',
    dept: 'Human Resources',
    posCode: 'RCR',
    type: 'full-time',
    status: 'active',
    joined: '2023-08-01',
    gender: 'male',
    dob: '1993-04-20',
  });

  // 18. HR Specialist (part-time)
  await createEmployee({
    number: 'EMP-018',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.t@hris-demo.com',
    dept: 'Human Resources',
    posCode: 'HRS',
    type: 'part-time',
    status: 'active',
    joined: '2024-06-01',
    gender: 'female',
    dob: '1996-12-05',
  });

  // 19. Financial Analyst
  await createEmployee({
    number: 'EMP-019',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.m@hris-demo.com',
    dept: 'Finance',
    posCode: 'FNA',
    type: 'full-time',
    status: 'active',
    joined: '2023-03-01',
    gender: 'male',
    dob: '1989-08-18',
  });

  // 20. Accountant
  await createEmployee({
    number: 'EMP-020',
    firstName: 'Hannah',
    lastName: "O'Brien",
    email: 'hannah.o@hris-demo.com',
    dept: 'Finance',
    posCode: 'ACC',
    type: 'full-time',
    status: 'active',
    joined: '2023-10-15',
    gender: 'female',
    dob: '1991-02-28',
  });

  // 21. Marketing Manager
  await createEmployee({
    number: 'EMP-021',
    firstName: 'Liam',
    lastName: 'Anderson',
    email: 'liam.a@hris-demo.com',
    dept: 'Marketing',
    posCode: 'MKM',
    type: 'full-time',
    status: 'active',
    joined: '2023-05-01',
    gender: 'male',
    dob: '1986-11-09',
    phone: '+1-555-0121',
    roleName: 'manager',
  });

  // 22. Marketing Analyst (notice period)
  await createEmployee({
    number: 'EMP-022',
    firstName: 'Isabella',
    lastName: 'Rossi',
    email: 'isabella.r@hris-demo.com',
    dept: 'Marketing',
    posCode: 'MKA',
    type: 'full-time',
    status: 'notice_period',
    joined: '2022-07-01',
    gender: 'female',
    dob: '1990-05-14',
  });

  // 23. Content Strategist
  await createEmployee({
    number: 'EMP-023',
    firstName: 'Noah',
    lastName: 'Singh',
    email: 'noah.s@hris-demo.com',
    dept: 'Marketing',
    posCode: 'CST',
    type: 'full-time',
    status: 'active',
    joined: '2024-02-01',
    gender: 'male',
    dob: '1994-09-30',
  });

  // 24. Operations Manager
  await createEmployee({
    number: 'EMP-024',
    firstName: 'Elena',
    lastName: 'Petrova',
    email: 'elena.p@hris-demo.com',
    dept: 'Operations',
    posCode: 'OPM',
    type: 'full-time',
    status: 'active',
    joined: '2022-11-01',
    gender: 'female',
    dob: '1984-07-08',
    phone: '+1-555-0124',
    roleName: 'manager',
  });

  // 25. Operations Analyst (probation)
  await createEmployee({
    number: 'EMP-025',
    firstName: 'Tyler',
    lastName: 'Jackson',
    email: 'tyler.j@hris-demo.com',
    dept: 'Operations',
    posCode: 'OPA',
    type: 'full-time',
    status: 'probation',
    joined: '2025-10-01',
    gender: 'male',
    dob: '1998-03-17',
  });

  // 26. Sales Manager
  await createEmployee({
    number: 'EMP-026',
    firstName: 'Sophia',
    lastName: 'Müller',
    email: 'sophia.m@hris-demo.com',
    dept: 'Sales',
    posCode: 'SLM',
    type: 'full-time',
    status: 'active',
    joined: '2023-01-15',
    gender: 'female',
    dob: '1987-06-25',
    phone: '+1-555-0126',
    roleName: 'manager',
  });

  // 27. Sales Executive
  await createEmployee({
    number: 'EMP-027',
    firstName: 'Ethan',
    lastName: 'Wright',
    email: 'ethan.w@hris-demo.com',
    dept: 'Sales',
    posCode: 'SLE',
    type: 'full-time',
    status: 'active',
    joined: '2023-09-01',
    gender: 'male',
    dob: '1992-11-12',
  });

  // 28. Account Manager (notice period)
  await createEmployee({
    number: 'EMP-028',
    firstName: 'Lisa',
    lastName: 'Chang',
    email: 'lisa.c@hris-demo.com',
    dept: 'Sales',
    posCode: 'ACM',
    type: 'full-time',
    status: 'notice_period',
    joined: '2021-05-01',
    gender: 'female',
    dob: '1988-01-30',
  });

  // 29. Sales Executive (contract)
  await createEmployee({
    number: 'EMP-029',
    firstName: 'Omar',
    lastName: 'Al-Rashid',
    email: 'omar.a@hris-demo.com',
    dept: 'Sales',
    posCode: 'SLE',
    type: 'contract',
    status: 'active',
    joined: '2024-08-01',
    gender: 'male',
    dob: '1995-04-22',
  });

  // 30. Intern / Junior Developer (part-time)
  await createEmployee({
    number: 'EMP-030',
    firstName: 'Zoe',
    lastName: 'Nguyen',
    email: 'zoe.n@hris-demo.com',
    dept: 'Engineering',
    posCode: 'JDE',
    type: 'part-time',
    status: 'probation',
    joined: '2026-01-15',
    gender: 'female',
    dob: '2002-08-19',
  });

  console.log('  ✅ 30 employees created across 6 departments');

  // ── Set Manager relationships ───────────
  // VP Eng reports to CEO, Engineering Manager reports to VP Eng
  await prisma.employee.update({ where: { id: vpEng.id }, data: { managerId: ceo.id } });
  await prisma.employee.update({ where: { id: hrDir.id }, data: { managerId: ceo.id } });

  console.log('  ✅ Manager relationships set');

  // ── Create Leave Types ──────────────────
  const leaveTypes = [
    {
      name: 'Annual Leave',
      code: 'AL',
      defaultDays: 20,
      color: '#3B82F6',
      isPaid: true,
      isEncashable: true,
    },
    { name: 'Sick Leave', code: 'SL', defaultDays: 10, color: '#EF4444', isPaid: true },
    { name: 'Casual Leave', code: 'CL', defaultDays: 5, color: '#F59E0B', isPaid: true },
    {
      name: 'Maternity Leave',
      code: 'ML',
      defaultDays: 90,
      color: '#EC4899',
      isPaid: true,
      applicableGender: 'female',
    },
    {
      name: 'Paternity Leave',
      code: 'PL',
      defaultDays: 10,
      color: '#8B5CF6',
      isPaid: true,
      applicableGender: 'male',
    },
    { name: 'Unpaid Leave', code: 'UL', defaultDays: 30, color: '#6B7280', isPaid: false },
    { name: 'Compensatory Off', code: 'CO', defaultDays: 0, color: '#10B981', isPaid: true },
  ];

  for (const lt of leaveTypes) {
    await prisma.leaveType.upsert({
      where: {
        organizationId_code: { organizationId: org.id, code: lt.code },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: lt.name,
        code: lt.code,
        defaultDays: lt.defaultDays,
        color: lt.color,
        isPaid: lt.isPaid ?? true,
        isEncashable: lt.isEncashable ?? false,
        applicableGender: lt.applicableGender,
        requiresApproval: true,
        allowHalfDay: true,
      },
    });
  }

  console.log(`  ✅ ${leaveTypes.length} leave types created`);

  // ── Create Shift Schedules ──────────────
  await prisma.shiftSchedule.create({
    data: {
      name: 'General Shift',
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 60,
      workDays: [1, 2, 3, 4, 5],
      isDefault: true,
      color: '#3B82F6',
    },
  });

  await prisma.shiftSchedule.create({
    data: {
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      breakMinutes: 60,
      workDays: [1, 2, 3, 4, 5],
      color: '#6366F1',
    },
  });

  console.log('  ✅ Shift schedules created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('   Login: admin@hris-demo.com / Demo@2026!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
