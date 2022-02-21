import axios from 'axios';
import { array } from 'typescript-json-decoder';
import { slugDecoder, postDecoder } from './decoders';
import { ErrorMessage, Post } from './types';
import { SanityAPI } from '.';

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
                    title,
                    "slug": slug.current,
                    body,
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
                    title,
                    "slug": slug.current,
                    body,
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

/* eslint-disable import/prefer-default-export */
export { PostAPI };
