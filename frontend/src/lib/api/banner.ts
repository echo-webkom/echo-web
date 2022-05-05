import axios from 'axios';
import { array, union, nil } from 'typescript-json-decoder';
import { bannerDecoder } from './decoders';
import { ErrorMessage, Banner } from './types';
import { SanityAPI } from '.';

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

/* eslint-disable import/prefer-default-export */
export { BannerAPI };
