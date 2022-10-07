import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { array, record, string, nil, union } from 'typescript-json-decoder';
import { slugDecoder } from '@utils/decoders';
import type { ErrorMessage } from '@utils/error';
import SanityAPI from '@api/sanity';

const staticInfoDecoder = record({
    name: (value) => record({ no: string, en: union(string, nil) })(value),
    slug: string,
    info: (value) => record({ no: string, en: union(string, nil) })(value),
});

type StaticInfo = decodeType<typeof staticInfoDecoder>;

const StaticInfoAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = `*[_type == "staticInfo"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return array(slugDecoder)(result).map((nestedSlug) => nestedSlug.slug);
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

            return array(staticInfoDecoder)(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error) && !error.response) {
                return {
                    message: '404',
                };
            }

            return {
                message: axios.isAxiosError(error) ? error.message : 'Fail @ getStaticInfoBySlug',
            };
        }
    },
};

export { StaticInfoAPI, type StaticInfo };
