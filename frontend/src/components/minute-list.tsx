import { useContext } from 'react';
import {
    Flex,
    Heading,
    Icon,
    Link,
    List,
    ListItem,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';
import NextLink from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';
import type { Minute } from '@api/minute';
import LanguageContext from 'language-context';

interface Props {
    minutes: Array<Minute>;
}

const MinuteList = ({ minutes }: Props): JSX.Element => {
    const color = useColorModeValue('blue', 'blue.400');
    const isNorwegian = useContext(LanguageContext);
    const years = new Array(...new Set(minutes.map((e) => e.date.split('-')[0])));

    return (
        <>
            <Heading mb="5">Møtereferater</Heading>
            {minutes.length === 0 ? (
                <Text>Ingen møtereferater</Text>
            ) : (
                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        {years.map((year) => (
                            <Tab key={year}>{year}</Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        {years.map((year) => (
                            <TabPanel key={year + 'TabPanel'}>
                                <List>
                                    {minutes
                                        .filter((minute) => minute.date.split('-')[0] === year)
                                        .map((minute) => (
                                            <ListItem key={minute.date}>
                                                <Flex align="center">
                                                    <NextLink href={minute.document} passHref>
                                                        <Link href={minute.document} color={color} isExternal mr=".5em">
                                                            {format(new Date(minute.date), 'dd. MMM yyyy', {
                                                                locale: isNorwegian ? nb : enUS,
                                                            })}
                                                        </Link>
                                                    </NextLink>
                                                    <Icon as={FaExternalLinkAlt} />
                                                </Flex>
                                            </ListItem>
                                        ))}
                                </List>
                            </TabPanel>
                        ))}
                        <TabPanel>
                            <p>one!</p>
                        </TabPanel>
                        <TabPanel>
                            <p>two!</p>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            )}
        </>
    );
};

export default MinuteList;
