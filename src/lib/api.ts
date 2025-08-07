

const API_URL = 'https://code-weaver-server-production.up.railway.app';

async function createApiRequest(path: string, options: RequestInit) {
    const { token, ...restOptions } = options.headers ? (options.headers as any) : { token: null };
    
    const headers = new Headers(restOptions);
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    
    try {
        const response = await fetch(`${API_URL}${path}`, { ...options, headers });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        if (response.status === 204) {
            return;
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
             throw new Error('Network Error: Failed to fetch. This is likely a CORS issue or the server is unreachable.');
        }
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

export const getPublicProjects = () => {
    return createApiRequest('/public/projects', {});
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

// Project Sharing and Settings
export interface ProjectSettings {
    isPublic: boolean;
}

export const getProjectSettings = (projectId: string, token: string) => {
    return createApiRequest(`/projects/${projectId}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

export const updateProjectSettings = (projectId: string, settings: ProjectSettings, token: string) => {
     return createApiRequest(`/projects/${projectId}/settings`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(settings),
    });
};

export const getContributors = (projectId: string, token: string) => {
     return createApiRequest(`/projects/${projectId}/contributors`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

export const addContributor = (projectId: string, email: string, token: string) => {
    return createApiRequest(`/projects/${projectId}/contributors`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ email }),
    });
};

export const removeContributor = (projectId: string, contributorId: string, token: string) => {
    return createApiRequest(`/projects/${projectId}/contributors/${contributorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

// Github
export const getGithubRepoContents = async (owner: string, repo: string, path: string = '') => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch repo contents: ${response.statusText}`);
    }
    return response.json();
}
