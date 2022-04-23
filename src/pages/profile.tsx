import React, { useState, useEffect } from 'react';
import SEO from '../components/seo';
import { UserAPI, User, isErrorMessage } from '../lib/api';

const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<User | undefined>();

    useEffect(() => {
        const fetchUser = async () => {
            const result = await UserAPI.getUser();
            if (isErrorMessage(result)) {
                console.log(result);
            } else {
                setUser(result);
            }
        };
        void fetchUser();
    }, []);
    console.log(user);

    return (
        <>
            <SEO title="Profile page" />
            <h1>dette er en profile side</h1>
        </>
    );
};

export default ProfilePage;
