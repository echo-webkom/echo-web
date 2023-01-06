import { z } from 'zod';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';

const colorSchema = z.object({
    hex: z.string(),
});

const bannerSchema = z.object({
    color: colorSchema,
    textColor: colorSchema,
    text: z.string(),
    linkTo: z.string().nullable(),
    isExternal: z.boolean(),
});
type Banner = z.infer<typeof bannerSchema>;

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

            return bannerSchema.array().parse(result)[0];
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: 'Fail @ getBanner',
            };
        }
    },
};

export { BannerAPI, type Banner };
