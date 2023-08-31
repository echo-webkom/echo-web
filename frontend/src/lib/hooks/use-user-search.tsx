import { useState, useEffect } from 'react';
import useAuth from './use-auth';
import type { SearchOptions, User } from '@api/user';
import { UserAPI } from '@api/user';
import type { ErrorMessage } from '@utils/error';
import { isErrorMessage } from '@utils/error';

interface SearchResult {
    users: Array<User> | null;
    error: ErrorMessage | null;
    loading: boolean;
    refetch: (opts: SearchOptions) => Promise<void>;
}

const useUserSearch = (opts: SearchOptions): SearchResult => {
    const { signedIn, idToken, error: userError } = useAuth();

    const [users, setUsers] = useState<Array<User> | null>(null);
    const [error, setError] = useState<ErrorMessage | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUsers = async ({ page, searchTerm }: SearchOptions) => {
        setError(null);

        if (!signedIn || !idToken || isErrorMessage(userError)) {
            setLoading(false);
            setError({ message: 'Du må være logget inn for å se denne siden.' });
            return;
        }

        const result = await UserAPI.getUsersWithOptions(idToken, {
            page,
            searchTerm,
        });

        if (isErrorMessage(result)) {
            setError(result);
        } else {
            setUsers(result);
        }

        setLoading(false);
    };

    useEffect(() => {
        void fetchUsers(opts);
        // Empty dependency array to only run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { users, error, loading, refetch: fetchUsers };
};

export default useUserSearch;
