import type { Metadata } from 'next';
import '../styles/globals.css';
import { QueryProvider } from '@/lib/query-provider';

export const metadata: Metadata = {
    title: {
        default: 'Project HRIS — Human Resource Information System',
        template: '%s | Project HRIS',
    },
    description:
        'Industrial-level Human Resource Information System with comprehensive HR management, policy engine, ML analytics, and self-diagnostic capabilities.',
    keywords: ['HRIS', 'HR', 'Human Resources', 'Employee Management', 'Payroll', 'Attendance'],
    authors: [{ name: 'Project HRIS' }],
    robots: 'noindex, nofollow',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" data-theme="light" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
