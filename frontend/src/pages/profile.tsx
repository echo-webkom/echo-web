import { Spinner, Center } from '@chakra-ui/react';
import Unauthorized from '@components/unauthorized';
import ProfileInfo from '@components/profile-info';
import SEO from '@components/seo';
import useUser from '@hooks/use-user';

const ProfilePage = (): JSX.Element => {
    const { loading, signedIn } = useUser();

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
