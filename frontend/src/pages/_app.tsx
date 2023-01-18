import { ChakraProvider } from '@chakra-ui/react';
import { Analytics } from '@vercel/analytics/react';
import { SessionProvider, type SessionProviderProps } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import theme from '@styles/theme';
import Layout from '@components/layout';
import { LanguageProvider } from '@hooks/use-language';
import { AuthProvider } from '@hooks/use-auth';

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps<SessionProviderProps>) => {
    const router = useRouter();

    return (
        <>
            <LanguageProvider>
                <SessionProvider session={session}>
                    <AuthProvider>
                        <ChakraProvider theme={theme}>
                            <NextNProgress
                                color="#29D"
                                startPosition={0.15}
                                stopDelayMs={200}
                                height={4}
                                options={{ showSpinner: false }}
                            />
                            <Layout>
                                <Component {...pageProps} key={router} />
                            </Layout>
                        </ChakraProvider>
                    </AuthProvider>
                </SessionProvider>
            </LanguageProvider>
            <Analytics />
        </>
    );
};

export default App;
