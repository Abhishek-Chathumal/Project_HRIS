import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ── Create Permissions ──────────────────
    const resources = ['employees', 'attendance', 'leave', 'payroll', 'recruitment', 'performance', 'training', 'policies', 'audit', 'settings'];
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
    const depts = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations', 'Sales'];
    const departments: Record<string, { id: string }> = {};

    for (const name of depts) {
        const dept = await prisma.department.create({
            data: {
                organizationId: org.id,
                name,
                code: name.substring(0, 3).toUpperCase(),
            },
        });
        departments[name] = dept;
    }

    console.log(`  ✅ ${depts.length} departments created`);

    // ── Create Admin User ───────────────────
    const passwordHash = await bcrypt.hash('Admin@2026!', 12);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@hris-demo.com' },
        update: {},
        create: {
            email: 'admin@hris-demo.com',
            passwordHash,
            isActive: true,
            isEmailVerified: true,
        },
    });

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
        update: {},
        create: { userId: adminUser.id, roleId: adminRole.id },
    });

    await prisma.employee.upsert({
        where: { userId: adminUser.id },
        update: {},
        create: {
            userId: adminUser.id,
            employeeNumber: 'EMP-001',
            firstName: 'System',
            lastName: 'Administrator',
            departmentId: departments['Human Resources'].id,
            joiningDate: new Date('2024-01-01'),
            employmentType: 'full-time',
            employmentStatus: 'active',
        },
    });

    console.log('  ✅ Admin user created: admin@hris-demo.com / Admin@2026!');

    // ── Create Leave Types ──────────────────
    const leaveTypes = [
        { name: 'Annual Leave', code: 'AL', defaultDays: 20, color: '#3B82F6', isPaid: true, isEncashable: true },
        { name: 'Sick Leave', code: 'SL', defaultDays: 10, color: '#EF4444', isPaid: true },
        { name: 'Casual Leave', code: 'CL', defaultDays: 5, color: '#F59E0B', isPaid: true },
        { name: 'Maternity Leave', code: 'ML', defaultDays: 90, color: '#EC4899', isPaid: true, applicableGender: 'female' },
        { name: 'Paternity Leave', code: 'PL', defaultDays: 10, color: '#8B5CF6', isPaid: true, applicableGender: 'male' },
        { name: 'Unpaid Leave', code: 'UL', defaultDays: 30, color: '#6B7280', isPaid: false },
        { name: 'Compensatory Off', code: 'CO', defaultDays: 0, color: '#10B981', isPaid: true },
    ];

    for (const lt of leaveTypes) {
        await prisma.leaveType.create({
            data: {
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
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
