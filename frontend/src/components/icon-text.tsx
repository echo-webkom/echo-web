import type { ColorProps, TextProps } from '@chakra-ui/react';
import { Grid, Icon, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { IconType } from 'react-icons';

interface Props extends TextProps {
    icon: IconType;
    iconColor?: ColorProps['color'];
    text: string;
    textColor?: ColorProps['color'];
    link?: string;
}

const IconText = ({ icon, iconColor, text, textColor, link, ...props }: Props) => {
    return (
        <Grid templateColumns="min-content auto" gap="3" wordBreak="break-word" alignItems="center">
            <Icon as={icon} boxSize={10} color={iconColor} />
            {!link && (
                <Text color={textColor} {...props}>
                    {text}
                </Text>
            )}
            {link && (
                <Link as={NextLink} href={link} color={textColor} isExternal>
                    {text}
                </Link>
            )}
        </Grid>
    );
};

export default IconText;
