import { array, record, Pojo, decodeType, string, boolean } from 'typescript-json-decoder';
import API from './api';
import { GET_N_MINUTES } from './schema';

export type Minute = decodeType<typeof minuteDecoder>;
const minuteDecoder = (value: Pojo) => {
    const baseDecoder = record({
        date: string,
        allmote: boolean,
    });

    const documentUrlDecoder = record({
        document: record({
            url: string,
        }),
    });

    return {
        ...baseDecoder(value),
        documentUrl: documentUrlDecoder(value).document.url,
    };
};

const minuteListDecoder = array(minuteDecoder);

export const MinuteAPI = {
    getMinutes: async (n: number): Promise<{ minutes: Array<Minute> | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_N_MINUTES,
                variables: {
                    n,
                },
            });

            return {
                minutes: minuteListDecoder(data.data.meetingMinuteCollection.items),
                error: null,
            };
        } catch (error) {
            return {
                minutes: null,
                error: `Error retrieving last ${n} meeting minutes`,
            };
        }
    },
};
