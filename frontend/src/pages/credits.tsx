import { useEffect } from 'react';
import type { GetStaticProps } from 'next';
import confetti from 'canvas-confetti';
import { Center, Text, Heading, GridItem, SimpleGrid } from '@chakra-ui/react';
import Section from '@components/section';
import SEO from '@components/seo';
import type { Profile } from '@api/profile';
import { ProfileAPI } from '@api/profile';
import { isErrorMessage } from '@utils/error';
import MemberProfile from '@components/member-profile';

const CreditsPage = ({ profiles }: { profiles: Array<Profile> }) => {
    const fireConfetti = () => {
        void confetti({
            spread: 180,
            particleCount: Math.random() * (100 - 50) + 50,
            origin: { y: 0.6, x: Math.random() * (0.7 - 0.3) + 0.3 },
        });
        const rand = Math.floor(Math.random() * 4000 + 500);
        setTimeout(fireConfetti, rand);
    };

    useEffect(() => {
        fireConfetti();
    });

    return (
        <>
            <SEO title="Credits" />
            <Section>
                <Center>
                    <Heading as="h1" size="xl" mb={4} paddingTop={10}>
                        Disse folka har bidratt til denne flotte nettsiden😁
                    </Heading>
                </Center>
                <Center pb={16}>
                    <Text>Se så flinke de er!</Text>
                </Center>
                <SimpleGrid columns={3} spacing={4} paddingBottom={10}>
                    {profiles.map((profile) => {
                        return (
                            <GridItem key={profile.name}>
                                <Center>
                                    <MemberProfile profile={profile} role="" />
                                </Center>
                            </GridItem>
                        );
                    })}
                </SimpleGrid>
            </Section>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const creditedUsers = [
        'Andreas Salhus Bakseter',
        'Bo Aanes',
        'Øyvind Grutle',
        'Alvar Hønsi',
        'Sander Sigmundstad',
        'Kristian Rosland',
        'Torger Bocianowski',
        'Felix Kaasa',
        'Ole Magnus Fon Johnsen',
        'Jonas Hammerseth',
        'Nikolaus Engh',
        'Thea Jenny Kolnes',
        'Malin Torset Sivertstøl',
        'Leoul Zinaye Tefera',
        'Kjetil Fantoft Alvestad',
        'Karolina Gil',
    ];

    const profiles = await ProfileAPI.getProfilesByName(creditedUsers);

    if (isErrorMessage(profiles)) throw new Error(profiles.message);

    return {
        props: {
            profiles,
        },
        revalidate: 60,
    };
};

export default CreditsPage;
