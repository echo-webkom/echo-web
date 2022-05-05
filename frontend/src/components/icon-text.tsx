import { ColorProps, Grid, Icon, Link, Text, TextProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';

interface Props extends TextProps {
    icon: IconType;
    iconColor?: ColorProps['color'];
    text: string;
    textColor?: ColorProps['color'];
    link?: string;
}

const IconText = ({ icon, iconColor, text, textColor, link, ...props }: Props): JSX.Element => {
    return (
        <Grid templateColumns="min-content auto" gap="3" wordBreak="break-word" alignItems="center">
            <Icon as={icon} boxSize={10} color={iconColor} />
            {!link && (
                <Text color={textColor} {...props}>
                    {text}
                </Text>
            )}
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
