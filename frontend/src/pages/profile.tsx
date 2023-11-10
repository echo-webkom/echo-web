import { Spinner, Center } from '@chakra-ui/react';
import Unauthorized from '@components/unauthorized';
import ProfileInfo from '@components/profile-info';
import SEO from '@components/seo';
import useAuth from '@hooks/use-auth';

const ProfilePage = () => {
    const { loading, signedIn } = useAuth();

    return (
        <>
            <SEO title={signedIn ? 'Min profil' : 'Logg inn'} />
            {loading && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {signedIn && <ProfileInfo />}
            {!signedIn && <Unauthorized />}
        </>
    );
};

export default ProfilePage;
