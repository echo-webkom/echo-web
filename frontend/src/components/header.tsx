import { Center, Flex, Spacer, useColorModeValue } from '@chakra-ui/react';
import { memo } from 'react';
import { DesktopNavBar, MobileNavBar } from '@components/navbar';
import HeaderLogo from '@components/header-logo';

const Header = () => {
    const borderBg = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <Center borderColor={borderBg} data-cy="header" m="2rem auto">
            <Flex w="90%" h="120px" alignItems="flex-end" maxW="1300" px={['0', '5%', '50']}>
                <HeaderLogo />
                <Spacer />
                <DesktopNavBar />
                <MobileNavBar />
            </Flex>
        </Center>
    );
};

export default memo(Header);
