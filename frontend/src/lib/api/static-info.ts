import { z } from 'zod';
import { slugSchema } from '@utils/schemas';
import type { ErrorMessage } from '@utils/error';
import SanityAPI from '@api/sanity';

const staticInfoSchema = z.object({
    name: z.string(),
    slug: z.string(),
    info: z.string(),
});
type StaticInfo = z.infer<typeof staticInfoSchema>;

const StaticInfoAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "staticInfo"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return slugSchema
                .array()
                .parse(result)
                .map((nestedSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return [];
        }
    },

    getStaticInfoBySlug: async (slug: string): Promise<StaticInfo | ErrorMessage> => {
        try {
            const query = `
                *[_type == "staticInfo" && slug.current == "${slug}" && !(_id in path('drafts.**'))] | order(name) {
                    name,
                    "slug": slug.current,
                    info,
                }`;
            const result = await SanityAPI.fetch(query);

            if (result.length === 0) {
                return {
                    message: '404',
                };
            }

            return staticInfoSchema.parse(result[0]);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },
};

export { StaticInfoAPI, type StaticInfo };
