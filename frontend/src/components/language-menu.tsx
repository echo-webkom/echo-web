import { useState, useEffect } from 'react';
import { Button, Divider, Flex } from '@chakra-ui/react';

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

    return (
        <Flex alignItems="center" justify="center">
            <Button bg="none" fontSize="xxl" onClick={() => setLanguage('no')} isDisabled={language === 'no'}>
                🇳🇴
            </Button>
            <Divider orientation="vertical" height="80%" />
            <Button bg="none" fontSize="xxl" onClick={() => setLanguage('en')} isDisabled={language === 'en'}>
                🇬🇧
            </Button>
        </Flex>
    );
};

export default LanguageMenu;
