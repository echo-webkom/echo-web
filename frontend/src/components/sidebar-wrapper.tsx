import {
    Grid,
    GridItem,
    useDisclosure,
    IconButton,
    Center,
    Icon,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerOverlay,
    DrawerCloseButton,
    DrawerHeader,
    Box,
    useColorModeValue,
    Heading,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import Section from '@components/section';
import Sidebar from '@components/sidebar';

interface Props {
    children: React.ReactNode;
}

const SidebarWrapper = ({ children }: Props) => {
    const separatorColor = useColorModeValue('bg.light.border', 'bg.dark.border');
    const highlightColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const bgColor = useColorModeValue('bg.light.secondary', 'bg.dark.secondary');
    const menuButtonRef = useRef<HTMLButtonElement>(null); // ref hook for drawer button
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Section>
                <Center
                    position="fixed"
                    left={-6}
                    top="10em"
                    h="4em"
                    w="4em"
                    bg={bgColor}
                    opacity="70%"
                    borderRadius="0 60% 60% 0"
                    border="2px"
                    borderColor={highlightColor}
                    display={['flex', null, null, 'flex', 'none']}
                >
                    <IconButton
                        variant="unstyled"
                        ref={menuButtonRef}
                        alignItems="center"
                        left={2}
                        onClick={onOpen}
                        aria-label="show sidebar"
                        h="4em"
                        icon={
                            <Center>
                                <Icon as={IoIosArrowForward} boxSize={14} />
                            </Center>
                        }
                        data-testid="sidebar-button"
                    />
                </Center>
                <Grid templateColumns="repeat(20, 1fr)" gap="1em">
                    <GridItem
                        colSpan={[0, null, null, 0, 5, 4]}
                        borderRight="2px"
                        borderColor={separatorColor}
                        display={['none', null, null, 'none', 'block']}
                    >
                        <Sidebar />

                        <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={menuButtonRef}>
                            <DrawerOverlay>
                                <DrawerContent data-testid="navbar-drawer">
                                    <DrawerCloseButton size="lg" />
                                    <DrawerHeader fontSize="2xl" as={Heading}>
                                        Info
                                    </DrawerHeader>
                                    <DrawerBody>
                                        <Box>
                                            <Sidebar onClick={onClose} />
                                        </Box>
                                    </DrawerBody>
                                </DrawerContent>
                            </DrawerOverlay>
                        </Drawer>
                    </GridItem>
                    <GridItem colSpan={[20, null, null, 20, 15, 16]}>{children}</GridItem>
                </Grid>
            </Section>
        </>
    );
};

export default SidebarWrapper;
