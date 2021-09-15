import axios from 'axios';
import { array, decodeType, nil, Pojo, record, string, union } from 'typescript-json-decoder';
import API from './api';
import { authorDecoder, publishedAtDecoder } from './decoders';
import handleError from './errors';
import { GET_N_POSTS, GET_POST_BY_SLUG, GET_POST_PATHS } from './schema';

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
        slug: string,
        body: string,
    });

    // Decoders for nested fields.

    const thumbnailDecoder = record({
        // We use union with nil, since the type
        // of thumbail is `{ url: string } | null`.
        thumbnail: union(
            record({
                url: string,
            }),
            nil,
        ),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Post.
    return {
        ...baseDecoder(value),
        publishedAt: publishedAtDecoder(value).sys.firstPublishedAt,
        author: authorDecoder(value).author.authorName,
        thumbnail: thumbnailDecoder(value).thumbnail?.url || null,
    };
};

// Decode a list of Post's.
const postListDecoder = array(postDecoder);

// Decoder for PostSlug.
// We don't infer type since it's not needed anywhere.
const postSlugDecoder = record({
    slug: string,
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
            const { data } = await API.post('', {
                query: GET_POST_PATHS,
            });

            return postSlugListDecoder(data.data.postCollection.items).map((postSlug) => postSlug.slug);
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
            const { data } = await API.post('', {
                query: GET_N_POSTS,
                variables: {
                    n,
                },
            });

            return {
                posts: postListDecoder(data.data.postCollection.items) || null,
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
            const { data } = await API.post('', {
                query: GET_POST_BY_SLUG,
                variables: {
                    slug,
                },
            });

            if (data.data.postCollection.items.length === 0) throw new Error();

            return {
                post: postListDecoder(data.data.postCollection.items)[0],
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
