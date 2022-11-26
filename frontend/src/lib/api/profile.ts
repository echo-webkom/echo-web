import { array, record, string, union, nil, type decodeType } from 'typescript-json-decoder';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';

const profileDecoder = record({
    name: string,
    imageUrl: union(string, nil),
});
type Profile = decodeType<typeof profileDecoder>;

const ProfileAPI = {
    getProfileByName: async (name: string): Promise<Profile | ErrorMessage> => {
        try {
            const query = `
                *[_type == "profile" && name == ${name}] {
                    name,
                    "imageUrl": picture.asset -> url
                }
            `;
            const result = await SanityAPI.fetch(query);

            return array(profileDecoder)(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },

    getProfilesByName: async (names: Array<string>): Promise<Array<Profile> | ErrorMessage> => {
        try {
            const query = `
                *[_type == "profile" && name in $names] | order(name asc) {
                    name,
                    "imageUrl": picture.asset -> url
                }
            `;
            const params = {
                names: names,
            };

            const result = await SanityAPI.fetch(query, params);

            return array(profileDecoder)(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },
};

export { ProfileAPI, profileDecoder, type Profile };
