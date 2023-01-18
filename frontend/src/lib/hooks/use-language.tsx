import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(true);

const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [isNorwegian, setIsNorwegian] = useState(true);

    useEffect(() => {
        const checkLanguageData = () => {
            const lang = localStorage.getItem('language');
            if (lang === 'en') {
                setIsNorwegian(false);
            } else {
                setIsNorwegian(true);
            }
        };
        checkLanguageData();
        window.addEventListener('storage', checkLanguageData);
        return () => {
            window.removeEventListener('storage', checkLanguageData);
        };
    }, []);

    return <LanguageContext.Provider value={isNorwegian}>{children}</LanguageContext.Provider>;
};

const useLanguage = (): boolean => useContext(LanguageContext);

export { LanguageProvider };
export default useLanguage;
