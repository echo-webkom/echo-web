import type { ButtonProps } from '@chakra-ui/react';
import { Button, useColorModeValue } from '@chakra-ui/react';

const ButtonLink = ({ ...props }: ButtonProps) => {
    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const active = useColorModeValue('button.light.primaryActive', 'button.dark.primaryActive');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    return (
        <Button
            bg={bg}
            color={textColor}
            _hover={{ bg: hover }}
            _active={{ borderColor: active }}
            borderRadius="0.5rem"
            {...props}
        />
    );
};

export default ButtonLink;
