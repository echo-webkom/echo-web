import type { ButtonProps } from '@chakra-ui/react';
import { Button, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';

interface Props extends ButtonProps {
    linkTo: string;
    isExternal?: boolean;
}

const ButtonLink = ({ linkTo, isExternal = false, ...props }: Props): JSX.Element => {
    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    return (
        <Button
            as={NextLink}
            href={linkTo}
            isExternal={isExternal}
            bg={bg}
            color={textColor}
            _hover={{ bg: hover }}
            _active={{ borderColor: active }}
            fontSize="xl"
            borderRadius="0.5rem"
            data-cy={linkTo}
            {...props}
        />
    );
};

export default ButtonLink;
