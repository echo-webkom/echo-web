import { useState, useEffect } from 'react';

const useLanguage = () => {
    const [language, setLanguage] = useState('no');
    const isNorwegian = language === 'no';

    useEffect(() => {
        const lang = localStorage.getItem('language');
        if (lang === 'en') {
            setLanguage('en');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('language', language);
        window.dispatchEvent(new Event('storage'));
    }, [language]);

    const toggleLanguage = () => {
        if (language === 'no') {
            setLanguage('en');
            return;
        }

        setLanguage('no');
    };

    return { isNorwegian, toggleLanguage };
};

export default useLanguage;
