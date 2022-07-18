import axios from 'axios';
import type { decodeType } from 'typescript-json-decoder';
import { array, union, nil, record, string, boolean } from 'typescript-json-decoder';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';

const bannerDecoder = record({
    color: string,
    text: string,
    linkTo: union(string, nil),
    isExternal: boolean,
});

type Banner = decodeType<typeof bannerDecoder>;

const BannerAPI = {
    getBanner: async (): Promise<Banner | null | ErrorMessage> => {
        try {
            const query = `
                    *[_type == "banner" && !(_id in path('drafts.**'))] {
                        color,
                        text,
                        linkTo,
                        isExternal
                    }`;

            const result = await SanityAPI.fetch(query);

            return array(union(bannerDecoder, nil))(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            if (axios.isAxiosError(error)) {
                return { message: !error.response ? '404' : error.message };
            }

            return {
                message: 'Fail @ getBanner',
            };
        }
    },
};

export { BannerAPI, type Banner };
