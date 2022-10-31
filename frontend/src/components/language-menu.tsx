import { useState, useEffect } from 'react';
import { Button } from '@chakra-ui/react';

const LanguageMenu = (): JSX.Element => {
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

    const clicked = (language: Flag) => {
        setLanguage(language);
    };

    type Flag = 'no' | 'en';

    return (
        <>
            <Button bg="none" fontSize="xxl" onClick={() => clicked('no')} marginRight="1rem">
                '🇳🇴'
            </Button>
            |
            <Button bg="none" fontSize="xxl" onClick={() => clicked('en')} marginRight="1rem">
                '🇬🇧'
            </Button>
        </>



    );
};

export default LanguageMenu;
