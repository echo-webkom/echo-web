import { useSession } from 'next-auth/react';
import { Spinner, Center } from '@chakra-ui/react';
import Unauthorized from '@components/unauthorized';
import ProfileInfo from '@components/profile-info';
import SEO from '@components/seo';

const ProfilePage = (): JSX.Element => {
    const { status } = useSession();

    return (
        <>
            <SEO title={status === 'authenticated' ? 'Min profil' : 'Logg inn'} />
            {status === 'authenticated' && <ProfileInfo />}
            {status === 'loading' && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {status === 'unauthenticated' && <Unauthorized />}
        </>
    );
};

export default ProfilePage;
