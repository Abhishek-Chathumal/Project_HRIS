'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';

const navItems = [
    {
        section: 'Main',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: 'home' },
            { label: 'Employees', href: '/dashboard/employees', icon: 'users' },
            { label: 'Attendance', href: '/dashboard/attendance', icon: 'clock' },
            { label: 'Leave', href: '/dashboard/leave', icon: 'calendar' },
        ],
    },
    {
        section: 'Management',
        items: [
            { label: 'Payroll', href: '/dashboard/payroll', icon: 'wallet' },
            { label: 'Recruitment', href: '/dashboard/recruitment', icon: 'briefcase' },
            { label: 'Performance', href: '/dashboard/performance', icon: 'target' },
            { label: 'Training', href: '/dashboard/training', icon: 'book' },
        ],
    },
    {
        section: 'System',
        items: [
            { label: 'Policies', href: '/dashboard/policies', icon: 'scroll' },
            { label: 'Analytics', href: '/dashboard/analytics', icon: 'chart' },
            { label: 'Diagnostics', href: '/dashboard/diagnostics', icon: 'activity' },
            { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
        ],
    },
];

const iconPaths: Record<string, string> = {
    home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
    calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18',
    wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
    briefcase: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
    target: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z',
    scroll: 'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H8',
    chart: 'M18 20V10 M12 20V4 M6 20v-6',
    activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
};

function NavIcon({ name }: { name: string }) {
    const d = iconPaths[name] || '';
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {d.split(' M').map((segment, i) => (
                <path key={i} d={i === 0 ? segment : `M${segment}`} />
            ))}
        </svg>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className={styles['dashboard-layout']}>
            {/* Sidebar */}
            <aside
                className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''} ${mobileOpen ? styles['mobile-open'] : ''}`}
            >
                <div className={styles['sidebar-header']}>
                    <div className={styles['sidebar-logo']}>H</div>
                    <span className={styles['sidebar-title']}>Project HRIS</span>
                </div>

                <nav className={styles['sidebar-nav']}>
                    {navItems.map((section) => (
                        <div key={section.section} className={styles['sidebar-section']}>
                            <div className={styles['sidebar-section-label']}>{section.section}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles['sidebar-link']} ${pathname === item.href ? styles.active : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <NavIcon name={item.icon} />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className={styles['sidebar-footer']}>
                    <button
                        className={styles['sidebar-link']}
                        onClick={() => {
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            window.location.href = '/login';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className={`${styles['main-content']} ${sidebarCollapsed ? styles['sidebar-collapsed'] : ''}`}>
                {/* Topbar */}
                <header className={styles.topbar}>
                    <div className={styles['topbar-left']}>
                        <button
                            className={styles['topbar-toggle']}
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            aria-label="Toggle sidebar"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>

                        <div className={styles['topbar-search']}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input type="text" placeholder="Search employees, policies..." className="input" />
                        </div>
                    </div>

                    <div className={styles['topbar-right']}>
                        <button className={styles['topbar-icon-btn']} aria-label="Notifications">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className={styles['notification-dot']} />
                        </button>

                        <button className={styles['topbar-icon-btn']} aria-label="Toggle theme">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        </button>

                        <div className={styles['topbar-user']}>
                            <div className={styles['topbar-avatar']}>SA</div>
                            <div>
                                <div className={styles['topbar-user-name']}>System Admin</div>
                                <div className={styles['topbar-user-role']}>Administrator</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={styles['page-content']}>
                    {children}
                </main>
            </div>
        </div>
    );
}
