import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { FeideGroupAPI } from '@api/feide-group';
import { UserAPI } from '@api/user';
import { isErrorMessage } from '@utils/error';
import { FeedbackAPI } from '@api/feedback';

export const authOptions: NextAuthOptions = {
    session: {
        maxAge: 3600,
    },
    jwt: {
        maxAge: 3600,
    },
    callbacks: {
        async signIn({ account, profile }) {
            const signInDisabeCheck = process.env.SIGN_IN_DISABLE_CHECK === 'true';
            if (signInDisabeCheck) {
                // eslint-disable-next-line no-console
                console.log('Sign in check disabled');
                return true;
            }

            const signInOnlyCollectData = process.env.SIGN_IN_ONLY_COLLECT_DATA === 'true';

            if (account?.access_token && account.id_token && profile?.email && profile.name) {
                const isMember = await FeideGroupAPI.isMemberOfGroup(account.access_token, 'fc:org:uib.no:unit:12120');

                if (!isMember) {
                    if (signInOnlyCollectData) {
                        const groups = await FeideGroupAPI.getGroups(account.access_token);
                        // eslint-disable-next-line no-console
                        console.log('User is not a member of the group, but only collecting data');
                        void FeedbackAPI.sendFeedback({
                            email: profile.email,
                            name: profile.name,
                            message: JSON.stringify(groups),
                        });
                        return true;
                    }
                    return '/nei';
                }

                const { email, name } = profile;

                const response = await UserAPI.postInitialUser(account.id_token, email, name);

                if (isErrorMessage(response)) {
                    if (signInOnlyCollectData) {
                        // eslint-disable-next-line no-console
                        console.log('User could not be created, but only collecting data');
                        void FeedbackAPI.sendFeedback({
                            email,
                            name,
                            message: response.message,
                        });
                        return true;
                    }
                    return '/500';
                }

                if (response.status === 200 || response.status === 409) {
                    return true;
                }

                if (signInOnlyCollectData) {
                    // eslint-disable-next-line no-console
                    console.log('User could not be created (status not 200 or 409), but only collecting data');
                    void FeedbackAPI.sendFeedback({
                        email,
                        name,
                        message: `Unknown error: ${JSON.stringify(response)}`,
                    });
                    return true;
                }
            }

            return '/500';
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        async jwt({ token, account }) {
            if (account) {
                token.idToken = account.id_token;
                token.accessToken = account.access_token;
            }

            return token;
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        async session({ session, token }) {
            const { idToken, accessToken } = token;

            if (typeof idToken === 'string' && typeof accessToken === 'string') {
                session.idToken = idToken;
                session.accessToken = accessToken;
            }

            return session;
        },
    },
    providers: [
        {
            id: 'feide',
            name: 'Feide',
            type: 'oauth',
            checks: process.env.SANITY_DATASET === 'testing' ? 'none' : undefined,
            wellKnown: 'https://auth.dataporten.no/.well-known/openid-configuration',
            authorization: {
                params: {
                    scope: 'email userinfo-name profile userid openid groups-edu groups-org groups-other',
                },
            },
            clientId: process.env.FEIDE_CLIENT_ID,
            clientSecret: process.env.FEIDE_CLIENT_SECRET,
            idToken: true,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
        },
    ],
};

export default NextAuth(authOptions);
