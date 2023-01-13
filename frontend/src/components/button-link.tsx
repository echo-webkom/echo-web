import type { ButtonProps } from '@chakra-ui/react';
import { Button, useColorModeValue, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

interface Props extends ButtonProps {
    href: string;
    isExternal?: boolean;
}

const ButtonLink = ({ href, isExternal, ...props }: Props): JSX.Element => {
    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    return (
        <Link as={NextLink} href={href} isExternal={isExternal}>
            <Button
                bg={bg}
                color={textColor}
                _hover={{ bg: hover }}
                _active={{ borderColor: active }}
                fontSize="xl"
                borderRadius="0.5rem"
                data-cy={href}
                {...props}
            />
        </Link>
    );
};

export default ButtonLink;
