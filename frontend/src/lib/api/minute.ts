import type { decodeType } from 'typescript-json-decoder';
import { array, record, string, boolean } from 'typescript-json-decoder';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';

const minuteDecoder = record({
    date: string,
    allmote: boolean,
    title: string,
    document: (value) => record({ asset: record({ url: string }) })(value).asset.url,
});

type Minute = decodeType<typeof minuteDecoder>;

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

            return array(minuteDecoder)(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return { message: JSON.stringify(error) };
        }
    },
};

export { MinuteAPI, type Minute };
