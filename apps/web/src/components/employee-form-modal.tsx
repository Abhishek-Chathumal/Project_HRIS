'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';

const log = createLogger('EmployeeFormModal');

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  departmentId: string;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  personalEmail: string;
  workPhone: string;
  gender: string;
  dateOfBirth: string;
  departmentId: string;
  positionId: string;
  employmentType: string;
  employmentStatus: string;
  joiningDate: string;
}

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  personalEmail?: string;
  workPhone?: string;
  gender?: string;
  dateOfBirth?: string;
  departmentId?: string;
  positionId?: string;
  employmentType: string;
  employmentStatus: string;
  joiningDate: string;
  department?: { id: string; name: string };
  position?: { id: string; title: string };
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null; // null = create mode, Employee = edit mode
}

const emptyForm: EmployeeFormData = {
  firstName: '',
  lastName: '',
  personalEmail: '',
  workPhone: '',
  gender: '',
  dateOfBirth: '',
  departmentId: '',
  positionId: '',
  employmentType: 'full-time',
  employmentStatus: 'active',
  joiningDate: new Date().toISOString().split('T')[0],
};

export default function EmployeeFormModal({ isOpen, onClose, employee }: EmployeeFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!employee;
  const [form, setForm] = useState<EmployeeFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Department[] }>('/employees/departments');
        return res.data;
      } catch {
        // Fallback: extract from employees list if no dedicated endpoint
        return [];
      }
    },
    enabled: isOpen,
  });

  // Fetch positions for dropdown (filtered by department)
  const { data: positions = [] } = useQuery<Position[]>({
    queryKey: ['positions', form.departmentId],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Position[] }>('/employees/positions', {
          ...(form.departmentId && { departmentId: form.departmentId }),
        });
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: isOpen,
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        personalEmail: employee.personalEmail || '',
        workPhone: employee.workPhone || '',
        gender: employee.gender || '',
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        departmentId: employee.departmentId || employee.department?.id || '',
        positionId: employee.positionId || employee.position?.id || '',
        employmentType: employee.employmentType || 'full-time',
        employmentStatus: employee.employmentStatus || 'active',
        joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [employee, isOpen]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      log.info('Create', 'Creating employee', { name: `${data.firstName} ${data.lastName}` });
      return api.post('/employees', data);
    },
    onSuccess: () => {
      toast.success('Employee Created', 'New employee has been added successfully.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
    onError: (err: Error) => {
      log.error('Create', 'Failed to create employee', { error: err.message });
      toast.error('Creation Failed', err.message || 'Could not create employee.');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      log.info('Update', 'Updating employee', {
        id: employee!.id,
        name: `${data.firstName} ${data.lastName}`,
      });
      return api.put(`/employees/${employee!.id}`, data);
    },
    onSuccess: () => {
      toast.success('Employee Updated', 'Employee details have been updated.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
    onError: (err: Error) => {
      log.error('Update', 'Failed to update employee', { error: err.message });
      toast.error('Update Failed', err.message || 'Could not update employee.');
    },
  });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.departmentId) errs.departmentId = 'Department is required';
    if (!form.joiningDate) errs.joiningDate = 'Joining date is required';
    if (form.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail)) {
      errs.personalEmail = 'Invalid email format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const updateField = (field: keyof EmployeeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    // Reset position when department changes
    if (field === 'departmentId') {
      setForm((prev) => ({ ...prev, [field]: value, positionId: '' }));
    }
  };

  if (!isOpen) return null;

  const filteredPositions = form.departmentId
    ? positions.filter((p) => p.departmentId === form.departmentId)
    : positions;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.2s',
        }}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '560px',
          maxWidth: '100vw',
          background: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-xl, -8px 0 24px rgba(0,0,0,0.15))',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
              {isEditing ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {isEditing
                ? `Editing ${employee!.firstName} ${employee!.lastName}`
                : 'Fill in the details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
            style={{ fontSize: '1.25rem' }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, overflow: 'auto', padding: 'var(--space-6)' }}
        >
          {/* Personal Information */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6)' }}>
            <legend
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-4)',
              }}
            >
              Personal Information
            </legend>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  First Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  className="input"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="e.g. Sarah"
                  style={errors.firstName ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.firstName && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 2 }}>
                    {errors.firstName}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Last Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  className="input"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="e.g. Johnson"
                  style={errors.lastName ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.lastName && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 2 }}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-4)',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Email
                </label>
                <input
                  className="input"
                  type="email"
                  value={form.personalEmail}
                  onChange={(e) => updateField('personalEmail', e.target.value)}
                  placeholder="email@example.com"
                  style={errors.personalEmail ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.personalEmail && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 2 }}>
                    {errors.personalEmail}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Phone
                </label>
                <input
                  className="input"
                  type="tel"
                  value={form.workPhone}
                  onChange={(e) => updateField('workPhone', e.target.value)}
                  placeholder="+1-555-0100"
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-4)',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Gender
                </label>
                <select
                  className="input"
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Date of Birth
                </label>
                <input
                  className="input"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {/* Employment Details */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6)' }}>
            <legend
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-4)',
              }}
            >
              Employment Details
            </legend>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Department <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="input"
                  value={form.departmentId}
                  onChange={(e) => updateField('departmentId', e.target.value)}
                  style={errors.departmentId ? { borderColor: 'var(--danger)' } : {}}
                >
                  <option value="">Select department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 2 }}>
                    {errors.departmentId}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Position
                </label>
                <select
                  className="input"
                  value={form.positionId}
                  onChange={(e) => updateField('positionId', e.target.value)}
                >
                  <option value="">Select position...</option>
                  {filteredPositions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-4)',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Employment Type
                </label>
                <select
                  className="input"
                  value={form.employmentType}
                  onChange={(e) => updateField('employmentType', e.target.value)}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Status
                </label>
                <select
                  className="input"
                  value={form.employmentStatus}
                  onChange={(e) => updateField('employmentStatus', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="notice_period">Notice Period</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  marginBottom: 'var(--space-1)',
                  color: 'var(--text-primary)',
                }}
              >
                Joining Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className="input"
                type="date"
                value={form.joiningDate}
                onChange={(e) => updateField('joiningDate', e.target.value)}
                style={{
                  ...(errors.joiningDate ? { borderColor: 'var(--danger)' } : {}),
                  maxWidth: '240px',
                }}
              />
              {errors.joiningDate && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 2 }}>
                  {errors.joiningDate}
                </span>
              )}
            </div>
          </fieldset>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
          }}
        >
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : isEditing ? (
              'Update Employee'
            ) : (
              'Create Employee'
            )}
          </button>
        </div>
      </div>

      <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </>
  );
}
