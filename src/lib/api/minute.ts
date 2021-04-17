import { array, record, Pojo, decodeType, string, boolean } from 'typescript-json-decoder';
import API from './api';
import { GET_N_MINUTES } from './schema';

// Automatically creates the Minute type with the
// fields we specify in our minuteDecoder.
export type Minute = decodeType<typeof minuteDecoder>;

const minuteDecoder = (value: Pojo) => {
    // Defines the structure of the JSON object we
    // are trying to decode, WITHOUT any fields
    // that are nested.
    //
    // For example, the field "author" is nested;
    //      author: { authorName: string }
    //
    // We need to define additional decoders
    // for these nested fields.
    const baseDecoder = record({
        date: string,
        allmote: boolean,
    });

    // Decoders for nested fields.

    const documentUrlDecoder = record({
        document: record({
            url: string,
        }),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Minute.
    return {
        ...baseDecoder(value),
        documentUrl: documentUrlDecoder(value).document.url,
    };
};

// Decode a list of Minute's.
const minuteListDecoder = array(minuteDecoder);

export const MinuteAPI = {
    /**
     * Get the n last meeting minutes.
     * @param n how many meeting minutes to retrieve
     */
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
