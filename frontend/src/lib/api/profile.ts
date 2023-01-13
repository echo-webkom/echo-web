import { z } from 'zod';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';

const profileSchema = z.object({
    name: z.string(),
    imageUrl: z.string().nullable(),
});
type Profile = z.infer<typeof profileSchema>;

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

            return profileSchema.parse(result[0]);
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

            return profileSchema.array().parse(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },
};

export { ProfileAPI, profileSchema, type Profile };
