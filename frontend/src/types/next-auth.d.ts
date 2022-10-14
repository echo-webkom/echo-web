import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface JWT {
        idToken: string;
        accessToken: string;
    }

    interface Session extends DefaultSession {
        idToken: string;
        accessToken: string;
    }
}
