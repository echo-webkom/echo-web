import { Grid, Icon, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';

interface Props {
    icon: IconType;
    text: string;
    link?: string;
}

const IconText = ({ icon, text, link }: Props): JSX.Element => {
    return (
        <Grid templateColumns="min-content auto" gap="3" wordBreak="break-word" alignItems="center">
            <Icon as={icon} boxSize={10} />
            {!link && <Text>{text}</Text>}
            {link && (
                <NextLink href={link} passHref>
                    <Link href={link} isExternal>
                        {text}
                    </Link>
                </NextLink>
            )}
        </Grid>
    );
};

export default IconText;
