import { nil, record, string, union, decodeType, array, Pojo } from 'typescript-json-decoder';
import API from './api';
import { GET_POST_PATHS, GET_N_POSTS, GET_POST_BY_SLUG } from './schema';
import { publishedAtDecoder, authorDecoder } from './decoders';

export type Post = decodeType<typeof postDecoder>;
const postDecoder = (value: Pojo) => {
    const baseDecoder = record({
        title: string,
        slug: string,
        body: string,
    });

    const thumbnailDecoder = record({
        thumbnail: union(
            record({
                url: string,
            }),
            nil,
        ),
    });

    return {
        ...baseDecoder(value),
        publishedAt: publishedAtDecoder(value).sys.firstPublishedAt,
        author: authorDecoder(value).author.authorName,
        thumbnail: thumbnailDecoder(value).thumbnail?.url || null,
    };
};
const postListDecoder = array(postDecoder);

export type PostSlug = decodeType<typeof postSlugDecoder>;
const postSlugDecoder = record({
    slug: string,
});

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
                posts: postListDecoder(data.data.postCollection.items),
                error: null,
            };
        } catch (error) {
            return {
                posts: null,
                error: `Error retrieving last ${n} posts`,
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

            return {
                post: postListDecoder(data.data.postCollection.items)[0],
                error: null,
            };
        } catch (error) {
            return {
                post: null,
                error: `Post '${slug}' not found`,
            };
        }
    },
};
