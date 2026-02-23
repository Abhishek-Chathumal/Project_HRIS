const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface RequestConfig {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('accessToken');
    }

    private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
        const url = new URL(`${API_BASE}${path}`, window.location.origin);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(key, String(value));
                }
            });
        }
        return url.toString();
    }

    async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
        const { method = 'GET', body, headers = {}, params } = config;
        const token = this.getToken();

        const res = await fetch(this.buildUrl(path, params), {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (res.status === 401) {
            // Try refresh token
            const refreshed = await this.refreshToken();
            if (refreshed) {
                return this.request(path, config);
            }
            // Redirect to login
            window.location.href = '/login';
            throw new Error('Session expired');
        }

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${res.status}`);
        }

        return res.json();
    }

    private async refreshToken(): Promise<boolean> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) return false;

            const data = await res.json();
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            return true;
        } catch {
            return false;
        }
    }

    get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
        return this.request<T>(path, { params });
    }

    post<T>(path: string, body?: unknown) {
        return this.request<T>(path, { method: 'POST', body });
    }

    put<T>(path: string, body?: unknown) {
        return this.request<T>(path, { method: 'PUT', body });
    }

    patch<T>(path: string, body?: unknown) {
        return this.request<T>(path, { method: 'PATCH', body });
    }

    delete<T>(path: string) {
        return this.request<T>(path, { method: 'DELETE' });
    }
}

export const api = new ApiClient();
