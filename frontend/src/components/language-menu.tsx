import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import useLanguage from '@hooks/use-language';

const LanguageMenu = ({ ...props }: ButtonProps) => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <Button bg="none" onClick={toggleLanguage} marginRight="1rem" {...props}>
            {language === 'en' ? '🇬🇧' : '🇳🇴'}
        </Button>
    );
};

export default LanguageMenu;
