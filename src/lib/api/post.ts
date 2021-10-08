import axios from 'axios';
import { array, decodeType, Pojo, record, string } from 'typescript-json-decoder';
import { SanityAPI } from './api';
import { authorDecoder, slugDecoder } from './decoders';
import handleError from './errors';

// Automatically creates the Post type with the
// fields we specify in our postDecoder.
export type Post = decodeType<typeof postDecoder>;

const postDecoder = (value: Pojo) => {
    // Defines the structure of the JSON object we
    // are trying to decode, WITHOUT any fields
    // that are nested.
    //
    // For example, the field "author" is nested;
    //      author: { authorName: string }
    //
    // We need to define additional decoders
    // for these nested fields.
    const baseDecoder = record({
        title: string,
        body: string,
        _createdAt: string,
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Post.
    return {
        ...baseDecoder(value),
        slug: slugDecoder(value).slug.current,
        author: authorDecoder(value).author.name,
    };
};

// Decode a list of Post's.
const postListDecoder = array(postDecoder);

// Decoder for PostSlug.
// We don't infer type since it's not needed anywhere.
const postSlugDecoder = record({
    slug: record({
        current: string,
    }),
});

// Decode a list of PostSlug's.
const postSlugListDecoder = array(postSlugDecoder);

export const PostAPI = {
    /**
     * Get the slugs of the 10 lasts posts.
     * This data is used to statically generate the pages of the 10 last published posts.
     */
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "post"]{slug}`;
            const data = await SanityAPI.fetch(query);

            return postSlugListDecoder(data).map((slugObject) => slugObject.slug.current);
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
            const query = `*[_type == "post"] | order(_createdAt desc) {title, slug, body, author->{name}, _createdAt, thumbnail}${limit}`;
            const data = await SanityAPI.fetch(query);

            return {
                posts: postListDecoder(data) || null,
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                posts: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
            };
        }
    },

    /**
     * Get a post by its slug.
     * @param slug the slug of the desired post.
     */
    getPostBySlug: async (slug: string): Promise<{ post: Post | null; error: string | null }> => {
        try {
            const query = `*[_type == "post" && slug.current == "${slug}"]{title, slug, body, author->{name}, _createdAt, thumbnail}`;
            const result = await SanityAPI.fetch(query);

            if (result.length === 0) throw new Error();

            return {
                post: postListDecoder(result)[0],
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    return {
                        post: null,
                        error: '404',
                    };
                }
            }

            return {
                post: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
            };
        }
    },
};
