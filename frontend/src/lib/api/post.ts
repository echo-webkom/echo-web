import { z } from 'zod';
import SanityAPI from '@api/sanity';
import { slugSchema } from '@utils/schemas';
import type { ErrorMessage } from '@utils/error';

const postSchema = z.object({
    title: z.object({
        no: z.string(),
        en: z.string().nullable().optional(),
    }),
    slug: z.string(),
    body: z.object({
        no: z.string(),
        en: z.string().nullable().optional(),
    }),
    author: z
        .object({
            name: z.string(),
        })
        .transform((a) => a.name),
    _createdAt: z.string(),
});
type Post = z.infer<typeof postSchema>;

const PostAPI = {
    /**
     * Get the slugs of the 10 lasts posts.
     * This data is used to statically generate the pages of the 10 last published posts.
     */
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "post"]{ "slug": slug.current }`;
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

    /**
     * Get the n last published posts.
     * @param n how many posts to retrieve
     */
    getPosts: async (n: number): Promise<Array<Post> | ErrorMessage> => {
        try {
            const limit = n === 0 ? `` : `[0...${n}]`;
            const query = `
                *[_type == "post" && !(_id in path('drafts.**'))] | order(_createdAt desc) {
                    title,
                    "slug": slug.current,
                    "body": select(
                        body.en != null => {"no": body.no, "en": body.en},
                        body.no != null => {"no": body.no, "en": null},
                        body
                      ),
                    author -> {name},
                    _createdAt,
                }${limit}`;

            const result = await SanityAPI.fetch(query);

            return postSchema.array().parse(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },

    /**
     * Get a post by its slug.
     * @param slug the slug of the desired post.
     */
    getPostBySlug: async (slug: string): Promise<Post | ErrorMessage> => {
        try {
            const query = `
                *[_type == "post" && slug.current == "${slug}" && !(_id in path('drafts.**'))] {
                    title,
                    "slug": slug.current,
                    "body": select(
                        body.en != null => {"no": body.no, "en": body.en},
                        body.no != null => {"no": body.no, "en": null},
                        body
                      ),
                    author -> {name},
                    _createdAt,
                }`;
            const result = await SanityAPI.fetch(query);

            if (result.length === 0) {
                return { message: '404' };
            }

            return postSchema.parse(result[0]);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },
};

export { PostAPI, type Post };
