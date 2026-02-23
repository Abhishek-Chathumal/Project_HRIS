import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// ── Types ──────────────────────────────────

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  employmentType: string;
  employmentStatus: string;
  joiningDate: string;
  user?: {
    email: string;
    isActive: boolean;
    lastLoginAt?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    title: string;
  };
  location?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface EmployeeListResponse {
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
}

// ── Hooks ──────────────────────────────────

/** Fetch paginated list of employees */
export function useEmployees(filters: EmployeeFilters = {}) {
  const { page = 1, limit = 20, search, departmentId, status } = filters;

  return useQuery({
    queryKey: ['employees', { page, limit, search, departmentId, status }],
    queryFn: () =>
      api
        .get<{ data: EmployeeListResponse }>('/employees', {
          page,
          limit,
          ...(search && { search }),
          ...(departmentId && { departmentId }),
          ...(status && { status }),
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev, // Keep previous data while fetching
  });
}

/** Fetch a single employee by ID */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => api.get<{ data: Employee }>(`/employees/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

/** Create a new employee */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<{ data: Employee }>('/employees', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

/** Update an existing employee */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put<{ data: Employee }>(`/employees/${id}`, data).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', id] });
    },
  });
}
