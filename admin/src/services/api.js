const API_BASE_URL = "http://localhost:5002/api";

export const getToken = () => {
    return localStorage.getItem("sab_admin_token");
};

export const saveToken = (token) => {
    localStorage.setItem("sab_admin_token", token);
};

export const clearToken = () => {
    localStorage.removeItem("sab_admin_token");
};

export async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        if (response.status === 401 && token) {
            clearToken();
        }

        throw new Error(
            data?.message ||
            `Request failed with status ${response.status}.`
        );
    }

    return data;
}

export async function loginAdmin(email, password) {
    const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    if (!result?.data?.token) {
        throw new Error(
            "The server did not return an authentication token."
        );
    }

    saveToken(result.data.token);

    return result.data.admin;
}

export async function getCurrentAdmin() {
    const result = await apiRequest("/auth/me");
    return result.data;
}

export default apiRequest;