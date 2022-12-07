import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { type User, UserAPI } from '@api/user';
import { isErrorMessage, type ErrorMessage } from '@utils/error';

interface Auth {
    user: User | null;
    idToken: string | null;
    signedIn: boolean;
    loading: boolean;
    error: ErrorMessage | null;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<Auth>({
    user: null,
    idToken: null,
    signedIn: false,
    loading: true,
    error: null,
    setUser: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [idToken, setIdToken] = useState<string | null>(session?.idToken ?? null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ErrorMessage | null>(null);

    const signedIn = status === 'authenticated' && !!user && !!idToken;

    useEffect(() => {
        const fetchUser = async () => {
            const userEmail = session?.user?.email ?? null;
            const userName = session?.user?.name ?? null;
            const sessionIdToken = session?.idToken ?? null;

            if (!userEmail || !userName || !sessionIdToken) {
                setLoading(false);
                setIdToken(null);
                return;
            }
            setIdToken(sessionIdToken);
            setLoading(true);

            const result = await UserAPI.getUser(userEmail, userName, sessionIdToken);

            if (isErrorMessage(result)) {
                setError(result);
            } else {
                setUser(result);
            }
            setLoading(false);
        };
        void fetchUser();
    }, [session]);

    return (
        <AuthContext.Provider
            value={{
                signedIn,
                user,
                idToken,
                loading,
                error,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = (): Auth => useContext(AuthContext);

export default useAuth;
export { AuthProvider };
