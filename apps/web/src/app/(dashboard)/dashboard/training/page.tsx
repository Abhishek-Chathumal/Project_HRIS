'use client';

import { useState } from 'react';
import styles from './training.module.css';

interface Course {
    id: string;
    title: string;
    category: string;
    instructor: string;
    duration: string;
    format: 'online' | 'in-person' | 'hybrid';
    level: 'beginner' | 'intermediate' | 'advanced';
    enrolled: number;
    capacity: number;
    startDate: string;
    status: 'upcoming' | 'in-progress' | 'completed';
    rating: number;
}

const mockCourses: Course[] = [
    { id: '1', title: 'Leadership Essentials', category: 'Management', instructor: 'Dr. Sarah Mitchell', duration: '8 weeks', format: 'hybrid', level: 'intermediate', enrolled: 18, capacity: 25, startDate: '2026-03-01', status: 'upcoming', rating: 4.7 },
    { id: '2', title: 'Advanced TypeScript & Node.js', category: 'Technical', instructor: 'Michael Chen', duration: '6 weeks', format: 'online', level: 'advanced', enrolled: 12, capacity: 20, startDate: '2026-02-15', status: 'in-progress', rating: 4.9 },
    { id: '3', title: 'GDPR Compliance Training', category: 'Compliance', instructor: 'Legal Team', duration: '2 hours', format: 'online', level: 'beginner', enrolled: 45, capacity: 100, startDate: '2026-01-10', status: 'completed', rating: 3.8 },
    { id: '4', title: 'Effective Communication', category: 'Soft Skills', instructor: 'Dr. Emily Ross', duration: '4 weeks', format: 'in-person', level: 'beginner', enrolled: 22, capacity: 30, startDate: '2026-03-10', status: 'upcoming', rating: 4.5 },
    { id: '5', title: 'Data Analysis with Python', category: 'Technical', instructor: 'James Rodriguez', duration: '10 weeks', format: 'online', level: 'intermediate', enrolled: 15, capacity: 15, startDate: '2026-02-01', status: 'in-progress', rating: 4.6 },
    { id: '6', title: 'Workplace Safety Basics', category: 'Compliance', instructor: 'Safety Committee', duration: '1 hour', format: 'online', level: 'beginner', enrolled: 78, capacity: 100, startDate: '2026-01-05', status: 'completed', rating: 4.0 },
];

const categoryColors: Record<string, string> = {
    Management: '#8B5CF6',
    Technical: '#3B82F6',
    Compliance: '#EF4444',
    'Soft Skills': '#10B981',
};

const statusConfig: Record<string, { label: string; class: string }> = {
    upcoming: { label: 'Upcoming', class: 'badge-info' },
    'in-progress': { label: 'In Progress', class: 'badge-warning' },
    completed: { label: 'Completed', class: 'badge-success' },
};

const levelColors: Record<string, string> = {
    beginner: 'badge-success',
    intermediate: 'badge-warning',
    advanced: 'badge-danger',
};

export default function TrainingPage() {
    const [categoryFilter, setCategoryFilter] = useState('');
    const categories = [...new Set(mockCourses.map((c) => c.category))];

    const filtered = categoryFilter
        ? mockCourses.filter((c) => c.category === categoryFilter)
        : mockCourses;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Training & Development</h1>
                    <p>Courses, certifications, and skill development programs</p>
                </div>
                <button className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Create Course
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    </div>
                    <div><div className="stat-value">{mockCourses.length}</div><div className="stat-label">Total Courses</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </div>
                    <div><div className="stat-value">{mockCourses.filter((c) => c.status === 'in-progress').length}</div><div className="stat-label">In Progress</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                    </div>
                    <div><div className="stat-value">{mockCourses.reduce((s, c) => s + c.enrolled, 0)}</div><div className="stat-label">Enrollments</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    </div>
                    <div><div className="stat-value">{(mockCourses.reduce((s, c) => s + c.rating, 0) / mockCourses.length).toFixed(1)}</div><div className="stat-label">Avg Rating</div></div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <button className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter('')}>All</button>
                {categories.map((cat) => (
                    <button key={cat} className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter(cat)}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Course Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {filtered.map((course) => (
                    <div key={course.id} className={styles.courseCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <div style={{ width: 10, height: 10, borderRadius: 'var(--radius-full)', background: categoryColors[course.category] || 'var(--text-tertiary)' }} />
                                <span className="text-xs text-secondary">{course.category}</span>
                            </div>
                            <span className={`badge ${statusConfig[course.status]?.class}`}>{statusConfig[course.status]?.label}</span>
                        </div>

                        <h4 style={{ marginBottom: 'var(--space-2)' }}>{course.title}</h4>
                        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-3)' }}>
                            by {course.instructor} · {course.duration}
                        </p>

                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                            <span className={`badge ${levelColors[course.level]}`}>{course.level}</span>
                            <span className="badge badge-neutral">{course.format}</span>
                        </div>

                        {/* Enrollment bar */}
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                <span className="text-xs text-secondary">Enrollment</span>
                                <span className="text-xs font-mono">{course.enrolled}/{course.capacity}</span>
                            </div>
                            <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${(course.enrolled / course.capacity) * 100}%`, borderRadius: 'var(--radius-full)',
                                    background: course.enrolled >= course.capacity ? 'var(--danger)' : course.enrolled / course.capacity > 0.8 ? 'var(--warning)' : 'var(--accent-primary)',
                                }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)' }}>
                            <span className="text-xs text-tertiary">
                                {course.startDate ? new Date(course.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </span>
                            <span className="text-xs font-mono" style={{ color: 'var(--warning)' }}>★ {course.rating}</span>
                            <button className="btn btn-sm btn-primary" disabled={course.enrolled >= course.capacity}>
                                {course.enrolled >= course.capacity ? 'Full' : 'Enroll'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
