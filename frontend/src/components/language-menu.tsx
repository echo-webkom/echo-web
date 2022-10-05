import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

const LanguageMenu = ({ ...props }: ButtonProps) => {
    const [language, setLanguage] = useState('no');

    useEffect(() => {
        // we can not use localstorage in the language useState decleration, this would cause a react hydration error.
        // so we have to set it via a useEffect.
        const lang = localStorage.getItem('language');
        if (lang === 'en') {
            setLanguage('en');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('language', language);
        // setItem only dispatches the storage event to other tabs on the same site, not the one that sendt it.
        // so we need to dispatch an event manually to get it on the current tab.
        window.dispatchEvent(new Event('storage'));
    }, [language]);

    const clicked = () => {
        if (language === 'no') {
            setLanguage('en');
            return;
        }
        setLanguage('no');
    };

    return (
        <Button bg="none" onClick={clicked} marginRight="1rem" {...props}>
            {language === 'en' ? '🇬🇧' : '🇳🇴'}
        </Button>
    );
};

export default LanguageMenu;
