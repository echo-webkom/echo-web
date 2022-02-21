import axios from 'axios';
import { array } from 'typescript-json-decoder';
import { minuteDecoder } from './decoders';
import { ErrorMessage, Minute } from './types';
import { SanityAPI } from '.';

const MinuteAPI = {
    /**
     * Get the n last meeting minutes.
     * @param n how many meeting minutes to retrieve
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
            return { message: axios.isAxiosError(error) ? error.message : 'Fail @ getMinutes' };
        }
    },
};

/* eslint-disable import/prefer-default-export */
export { MinuteAPI };
