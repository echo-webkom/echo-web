import axios from 'axios';
import { array, decodeType, record, string } from 'typescript-json-decoder';
import handleError from './errors';
import { SanityAPI } from '.';

// Automatically creates the Post type with the
// fields we specify in our postDecoder.
type Post = decodeType<typeof postDecoder>;
const postDecoder = record({
    title: string,
    body: string,
    slug: string,
    author: (value) => record({ name: string })(value).name,
    _createdAt: string,
});

type PostSlug = decodeType<typeof postSlugDecoder>;
const postSlugDecoder = record({
    slug: string,
});

const PostAPI = {
    /**
     * Get the slugs of the 10 lasts posts.
     * This data is used to statically generate the pages of the 10 last published posts.
     */
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "post"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(postSlugDecoder)(result).map((nestedSlug: PostSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return [];
        }
    },

    /**
     * Get the n last published posts.
     * @param n how many posts to retrieve
     */
    getPosts: async (n: number): Promise<{ posts: Array<Post> | null; error: string | null }> => {
        try {
            const limit = n === 0 ? `` : `[0...${n}]`;
            const query = `
                *[_type == "post" && !(_id in path('drafts.**'))] | order(_createdAt desc) {
                    title,
                    "slug": slug.current,
                    body,
                    author -> {name},
                    _createdAt,
                    thumbnail
                }${limit}`;

            const result = await SanityAPI.fetch(query);

            return {
                posts: array(postDecoder)(result),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                posts: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status ?? 500 : 500),
            };
        }
    },

    /**
     * Get a post by its slug.
     * @param slug the slug of the desired post.
     */
    getPostBySlug: async (slug: string): Promise<{ post: Post | null; error: string | null }> => {
        try {
            const query = `
                *[_type == "post" && slug.current == "${slug}" && !(_id in path('drafts.**'))] {
                    title,
                    "slug": slug.current,
                    body,
                    author -> {name},
                    _createdAt,
                    thumbnail
                }`;
            const result = await SanityAPI.fetch(query);

            if (result.length === 0) {
                return {
                    post: null,
                    error: '404',
                };
            }

            return {
                post: array(postDecoder)(result)[0],
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error) && !error.response) {
                return {
                    post: null,
                    error: '404',
                };
            }

            return {
                post: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status ?? 500 : 500),
            };
        }
    },
};

export { PostAPI };
export type { Post };
