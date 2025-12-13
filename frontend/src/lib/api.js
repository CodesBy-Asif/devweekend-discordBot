// API helper with cookie credentials
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    const config = {
        ...options,
        credentials: 'include', // Send cookies with requests
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    // Don't set Content-Type for FormData (file uploads)
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const response = await fetch(url, config);
    return response;
}

export async function apiGet(endpoint) {
    return apiFetch(endpoint, { method: 'GET' });
}

export async function apiPost(endpoint, data) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    });
}

export async function apiPut(endpoint, data) {
    return apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export async function apiDelete(endpoint) {
    return apiFetch(endpoint, { method: 'DELETE' });
}
