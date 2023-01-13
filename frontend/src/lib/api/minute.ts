import { z } from 'zod';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';

const minuteSchema = z.object({
    date: z.string(),
    allmote: z.boolean(),
    title: z.string(),
    document: z
        .object({
            asset: z.object({
                url: z.string(),
            }),
        })
        .transform((m) => m.asset.url),
});
type Minute = z.infer<typeof minuteSchema>;

const MinuteAPI = {
    /**
     * Get all meeting minutes.
     */
    getMinutes: async (): Promise<Array<Minute> | ErrorMessage> => {
        try {
            const query = `
                *[_type == "meetingMinute" && !(_id in path('drafts.**'))] | order(date desc) {
                    allmote,
                    date,
                    title,
                    document {
                        asset -> {
                            url
                        }
                    }
                }`;

            const result = await SanityAPI.fetch(query);

            return minuteSchema.array().parse(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },
};

export { MinuteAPI, type Minute };
