import type { decodeType } from 'typescript-json-decoder';
import { array, union, nil, record, string, boolean } from 'typescript-json-decoder';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';

const colorDecoder = (val: unknown) => record({ hex: string })(val).hex;

const bannerDecoder = record({
    color: colorDecoder,
    textColor: colorDecoder,
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
                        textColor,
                        text,
                        linkTo,
                        isExternal
                    }`;

            const result = await SanityAPI.fetch(query);

            return array(union(bannerDecoder, nil))(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: 'Fail @ getBanner',
            };
        }
    },
};

export { BannerAPI, type Banner };
