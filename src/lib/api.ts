
const API_URL = 'https://code-weaver-server-production.up.railway.app';

async function createApiRequest(path: string, options: RequestInit) {
    try {
        const response = await fetch(`${API_URL}${path}`, options);

        if (!response.ok) {
            let errorData;
            try {
                 // Try to parse a JSON error response from the server
                errorData = await response.json();
            } catch (e) {
                // If the server returns a non-JSON error (e.g., plain text)
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }
            // Throw the specific error message from the server's JSON response
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Handle successful responses with no content (like DELETE)
        if (response.status === 204) {
            return;
        }

        return response.json();
    } catch (error) {
        // This catches network errors (like CORS, DNS, or server unreachable)
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
             throw new Error('Network Error: Failed to fetch. This is likely a CORS issue or the server is unreachable.');
        }
        // Re-throw errors from the response handling above or other unexpected errors
        throw error;
    }
}

// Auth
export const register = (username: string, email: string, password: string) => {
    return createApiRequest('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });
};

export const login = (email: string, password: string) => {
    return createApiRequest('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
};

export const logout = (token: string) => {
    return createApiRequest('/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

// Projects
export const getProjects = (token: string) => {
    return createApiRequest('/projects', {
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

export const getProjectById = (id: string, token: string) => {
    return createApiRequest(`/projects/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

interface FileData {
    name: string;
    content: string;
}

interface ProjectData {
    name:string;
    files: FileData[];
}

export const createProject = (project: ProjectData, token: string) => {
    return createApiRequest('/projects', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(project),
    });
};

export const updateProject = (id: string, project: ProjectData, token: string) => {
    return createApiRequest(`/projects/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(project),
    });
};

export const deleteProject = (id: string, token: string) => {
    return createApiRequest(`/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
};
