import {
createContext,
useContext,
useEffect,
useState,
} from "react";

import {
clearToken,
getToken,
getCurrentAdmin,
loginAdmin,
} from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
const [admin, setAdmin] = useState(null);
const [loading, setLoading] = useState(true);


useEffect(() => {
    let active = true;

    async function restoreSession() {
        if (!getToken()) {
            if (active) {
                setLoading(false);
            }
            return;
        }

        try {
            const currentAdmin = await getCurrentAdmin();

            if (active) {
                setAdmin(currentAdmin);
            }
        } catch (error) {
            clearToken();

            if (active) {
                setAdmin(null);
            }
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    }

    restoreSession();

    return () => {
        active = false;
    };
}, []);

async function login(email, password) {
    const authenticatedAdmin = await loginAdmin(email, password);
    setAdmin(authenticatedAdmin);
    return authenticatedAdmin;
}

function logout() {
    clearToken();
    setAdmin(null);
}

return (
    <AuthContext.Provider
        value={{
            admin,
            loading,
            isAuthenticated: Boolean(admin),
            login,
            logout,
        }}
    >
        {children}
    </AuthContext.Provider>
);


}

export function useAuth() {
const context = useContext(AuthContext);


if (!context) {
    throw new Error(
        "useAuth must be used inside an AuthProvider."
    );
}

return context;


}
