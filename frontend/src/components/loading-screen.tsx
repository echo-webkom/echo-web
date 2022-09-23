import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LanguageContext from 'language-context';
import Image from 'next/image';
import { useContext } from 'react';
import Section from './section';

const ECHO_LOGO = '/echo-logo-only.png';

const LoadingScreen = () => {
    const isNorwegian = useContext(LanguageContext);

    return (
        <Section>
            <Flex direction="column" w="100%" justify="center" justifyItems="center">
                <Box mx="auto" mt="10" mb="5">
                    <motion.div
                        initial={{ rotate: '0deg' }}
                        animate={{ rotate: '360deg' }}
                        transition={{ duration: 3, repeat: Infinity, type: 'spring' }}
                    >
                        <Image src={ECHO_LOGO} width="250px" height="250px" />
                    </motion.div>
                </Box>
                <Heading textAlign="center" fontSize="3xl" my="10">
                    {isNorwegian ? 'Laster inn...' : 'Loading...'}
                </Heading>
            </Flex>
        </Section>
    );
};

export default LoadingScreen;
