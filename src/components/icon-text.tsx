import { ColorProps, Colors, Grid, Icon, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';

interface Props {
    icon: IconType;
    iconColor?: ColorProps['color'];
    text: string;
    textColor?: ColorProps['color'];
    link?: string;
}

const IconText = ({ icon, iconColor, text, textColor, link }: Props): JSX.Element => {
    return (
        <Grid templateColumns="min-content auto" gap="3" wordBreak="break-word" alignItems="center">
            <Icon as={icon} boxSize={10} color={iconColor} />
            {!link && <Text color={textColor}>{text}</Text>}
            {link && (
                <NextLink href={link} passHref>
                    <Link href={link} color={textColor} isExternal>
                        {text}
                    </Link>
                </NextLink>
            )}
        </Grid>
    );
};

export default IconText;
