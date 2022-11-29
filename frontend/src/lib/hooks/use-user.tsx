import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { type User, UserAPI } from '@api/user';
import { isErrorMessage, type ErrorMessage } from '@utils/error';

interface HookObject {
    user: User | null;
    signedIn: boolean;
    loading: boolean;
    error: ErrorMessage | null;
    setUser: (user: User) => void;
}

const UserContext = createContext<HookObject>({
    user: null,
    signedIn: false,
    loading: true,
    error: null,
    setUser: () => {},
});

const UserProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ErrorMessage | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!session?.user?.email || !session.user.name || !session.idToken) {
                setLoading(false);
                return;
            }
            setLoading(true);

            const result = await UserAPI.getUser(session.user.email, session.user.name, session.idToken);

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
        <UserContext.Provider
            value={{
                signedIn: status === 'authenticated' && user !== null,
                user,
                loading,
                error,
                setUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

const useUser = (): HookObject => useContext(UserContext);

export default useUser;
export { UserProvider };
