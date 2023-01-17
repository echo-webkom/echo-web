import { useColorModeValue, Center, Flex, Spacer, Button, Text, Link } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { IoMdHome } from 'react-icons/io';
import Section from '@components/section';
import useLanguage from '@hooks/use-language';

const Unauthorized = () => {
    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const isNorwegian = useLanguage();

    return (
        <Center>
            <Section position="relative" height="300px" width="500px" alignContent="center">
                <Flex direction="column" height="100%" justifyContent="center">
                    <Text align="center" fontSize="2xl" fontWeight="extrabold">
                        {isNorwegian ? 'Du er ikke logget inn' : 'You are not logged in'}
                    </Text>
                    <Spacer />
                    <Button
                        width="fit-content"
                        margin="auto"
                        bg={bg}
                        color={textColor}
                        _hover={{ bg: hover }}
                        _active={{ borderColor: active }}
                        fontSize="lg"
                        borderRadius="0.5rem"
                        onClick={() => void signIn('feide')}
                    >
                        {isNorwegian ? 'Logg inn med Feide' : 'Sign in with Feide'}
                    </Button>
                    <Spacer />
                    <Link href="/" alignItems="center" justifyContent="center" display="flex">
                        <IoMdHome /> {isNorwegian ? 'Hovedside' : 'Homepage'}
                    </Link>
                </Flex>
            </Section>
        </Center>
    );
};

export default Unauthorized;
