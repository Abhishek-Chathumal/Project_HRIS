// ============================================
// @hris/shared — Shared Types & Constants
// ============================================

// ── Enums ─────────────────────────────────

export const EmploymentStatus = {
    ACTIVE: 'active',
    PROBATION: 'probation',
    NOTICE_PERIOD: 'notice_period',
    SUSPENDED: 'suspended',
    TERMINATED: 'terminated',
    RESIGNED: 'resigned',
    RETIRED: 'retired',
} as const;

export const EmploymentType = {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACT: 'contract',
    INTERN: 'intern',
    FREELANCE: 'freelance',
    TEMPORARY: 'temporary',
} as const;

export const LeaveStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
} as const;

export const AttendanceStatus = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    HALF_DAY: 'half-day',
    HOLIDAY: 'holiday',
    LEAVE: 'leave',
    WORK_FROM_HOME: 'wfh',
} as const;

export const PolicyStatus = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    ARCHIVED: 'archived',
} as const;

export const PayrollStatus = {
    DRAFT: 'draft',
    PROCESSING: 'processing',
    APPROVED: 'approved',
    PAID: 'paid',
    CANCELLED: 'cancelled',
} as const;

export const UserRoles = {
    ADMIN: 'admin',
    HR_MANAGER: 'hr_manager',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
} as const;

// ── Types ─────────────────────────────────

export type EmploymentStatusType = typeof EmploymentStatus[keyof typeof EmploymentStatus];
export type EmploymentTypeType = typeof EmploymentType[keyof typeof EmploymentType];
export type LeaveStatusType = typeof LeaveStatus[keyof typeof LeaveStatus];
export type AttendanceStatusType = typeof AttendanceStatus[keyof typeof AttendanceStatus];
export type PolicyStatusType = typeof PolicyStatus[keyof typeof PolicyStatus];
export type PayrollStatusType = typeof PayrollStatus[keyof typeof PayrollStatus];
export type UserRoleType = typeof UserRoles[keyof typeof UserRoles];

// ── API Response Types ────────────────────

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    statusCode: number;
    message: string | string[];
    error: string;
    requestId: string;
    timestamp: string;
    path: string;
}

// ── Pagination ────────────────────────────

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ── Constants ─────────────────────────────

export const PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

export const PASSWORD_REQUIREMENTS = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
} as const;

export const SUPPORTED_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY', 'CNY', 'SGD', 'LKR',
] as const;

export const SUPPORTED_LOCALES = [
    'en', 'es', 'fr', 'de', 'ja', 'zh', 'hi', 'ar', 'pt', 'si',
] as const;
