import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import useLanguage from '@hooks/use-language';

const LanguageMenu = ({ ...props }: ButtonProps) => {
    const { isNorwegian, toggleLanguage } = useLanguage();

    return (
        <Button bg="none" onClick={toggleLanguage} marginRight="1rem" {...props}>
            {isNorwegian ? '🇬🇧' : '🇳🇴'}
        </Button>
    );
};

export default LanguageMenu;
