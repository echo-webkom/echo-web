import axios from 'axios';
import { decodeType, nil, union } from 'typescript-json-decoder';
import { array, record, string } from 'typescript-json-decoder';
import SanityAPI from '@api/sanity';
import { slugDecoder } from '@utils/decoders';
import type { ErrorMessage } from '@utils/error';

const postDecoder = record({
    title: (value) =>
        typeof value === 'string'
            ? { no: string(value), en: string(value) }
            : record({ no: string, en: union(string, nil) })(value),
    slug: string,
    body: (value) =>
        typeof value === 'string'
            ? { no: string(value), en: string(value) }
            : record({ no: string, en: union(string, nil) })(value),
    author: (value) => record({ name: string })(value).name,
    _createdAt: string,
});
type Post = decodeType<typeof postDecoder>;

const PostAPI = {
    /**
     * Get the slugs of the 10 lasts posts.
     * This data is used to statically generate the pages of the 10 last published posts.
     */
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "post"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(slugDecoder)(result).map((nestedSlug) => nestedSlug.slug);
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
                    "title": select(
                        title.en != null => {"no": title.no, "en": title.en},
                        title.no != null => {"no": title.no, "en": null},
                        title
                    ),
                    "slug": slug.current,
                    "body": select(
                        body.en != null => {"no": body.no, "en": body.en},
                        body.no != null => {"no": body.no, "en": null},
                        body
                      ),
                    author -> {name},
                    _createdAt,
                    thumbnail
                }${limit}`;

            const result = await SanityAPI.fetch(query);

            return array(postDecoder)(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: axios.isAxiosError(error) ? error.message : 'Fail @ getPosts' };
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
                    "title": select(
                        title.en != null => {"no": title.no, "en": title.en},
                        title.no != null => {"no": title.no, "en": null},
                        title
                    ),
                    "slug": slug.current,
                    "body": select(
                        body.en != null => {"no": body.no, "en": body.en},
                        body.no != null => {"no": body.no, "en": null},
                        body
                      ),
                    author -> {name},
                    _createdAt,
                    thumbnail
                }`;
            const result = await SanityAPI.fetch(query);

            if (result.length === 0) {
                return { message: '404' };
            }

            return array(postDecoder)(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error) && !error.response) {
                return {
                    message: '404',
                };
            }

            return {
                message: axios.isAxiosError(error) ? error.message : 'Fail @ getPostBySlug',
            };
        }
    },
};

export { PostAPI, type Post };
