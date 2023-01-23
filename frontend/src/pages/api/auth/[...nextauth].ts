import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { FeideGroupAPI } from '@api/feide-group';
import { UserAPI } from '@api/user';
import { isErrorMessage } from '@utils/error';
import { FeedbackAPI } from '@api/feedback';
import { allValidFeideGroups } from '@utils/degree';

const isProd = (process.env.VERCEL_ENV ?? 'production') === 'production';
const testEmail = 'test.mctest@student.uib.no';
const testName = 'Test McTest';

export const authOptions: NextAuthOptions = {
    session: {
        maxAge: 8 * 60 * 60,
    },
    callbacks: {
        signIn: async ({ account, profile }) => {
            if (!isProd) {
                const testToken = await UserAPI.getTestToken(testEmail);

                if (isErrorMessage(testToken)) {
                    // eslint-disable-next-line no-console
                    console.error(testToken.message);
                    return `/500?msg=${encodeURIComponent(testToken.message)}`;
                }

                const response = await UserAPI.postInitialUser(testToken, testEmail, testName);

                if (isErrorMessage(response)) {
                    // eslint-disable-next-line no-console
                    console.error(response.message);
                    return `/500?msg=${encodeURIComponent(response.message)}`;
                }

                if (response.status === 200 || response.status === 409) {
                    return true;
                }

                // eslint-disable-next-line no-console
                console.log('Failed to create user:', response);
                return `/500?msg=${encodeURIComponent(response.response)}`;
            }

            const signInDisabeCheck = process.env.SIGN_IN_DISABLE_CHECK === 'true';
            if (signInDisabeCheck) {
                // eslint-disable-next-line no-console
                console.log('Sign in check disabled');
                return true;
            }

            const signInOnlyCollectData = process.env.SIGN_IN_ONLY_COLLECT_DATA === 'true';

            if (!account?.access_token || !account.id_token || !profile?.email || !profile.name) {
                // eslint-disable-next-line no-console
                console.error('Missing data in sign in');
                return '/500';
            }

            const groups = await FeideGroupAPI.getGroups(account.access_token);

            if (isErrorMessage(groups)) {
                // eslint-disable-next-line no-console
                console.log('Failed to fetch groups:', groups);
                return '/500';
            }

            const isMember = groups.map((group) => group.id).some((id) => allValidFeideGroups.includes(id));

            if (!isMember) {
                if (signInOnlyCollectData) {
                    // eslint-disable-next-line no-console
                    console.log('User is not a member of any valid group, but only collecting data');
                    void FeedbackAPI.sendFeedback({
                        email: profile.email,
                        name: profile.name,
                        message: JSON.stringify(groups),
                    });
                } else {
                    // eslint-disable-next-line no-console
                    console.log('Denying user access, not a member of any valid group');
                    return '/nei';
                }
            }

            const { email, name } = profile;

            const response = await UserAPI.postInitialUser(account.id_token, email, name);

            if (isErrorMessage(response)) {
                // eslint-disable-next-line no-console
                console.log('Failed to create user:', response);
                return '/500';
            }

            if (response.status === 200 || response.status === 409) {
                return true;
            }

            // eslint-disable-next-line no-console
            console.log('Failed to create user:', response);
            return '/500';
        },
        jwt: async ({ token, account }) => {
            if (!isProd) {
                const testToken = await UserAPI.getTestToken(testEmail);

                if (isErrorMessage(testToken)) {
                    // eslint-disable-next-line no-console
                    console.log('Failed to get test token:', testToken);
                } else {
                    token.idToken = testToken;
                    token.accessToken = 'bruh';
                }
            } else if (account) {
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
        isProd
            ? {
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
                  profile: (profile) => {
                      return {
                          id: profile.sub,
                          name: profile.name,
                          email: profile.email,
                          image: profile.picture,
                      };
                  },
              }
            : CredentialsProvider({
                  name: 'Credentials',
                  credentials: {
                      username: {
                          label: 'Username',
                          type: 'text',
                          placeholder: 'test',
                      },
                      password: { label: 'Password', type: 'password' },
                  },
                  // eslint-disable-next-line @typescript-eslint/require-await
                  authorize: async () => {
                      return {
                          id: '1',
                          name: 'Test McTest',
                          email: 'test.mctest@student.uib.no',
                          image: 'https://i.pravatar.cc/150?u=jsmith@example.com',
                      };
                  },
              }),
    ],
};

export default NextAuth(authOptions);
