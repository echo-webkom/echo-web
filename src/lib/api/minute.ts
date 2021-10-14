import axios from 'axios';
import { array, boolean, decodeType, Pojo, record, string } from 'typescript-json-decoder';
import { SanityAPI } from './api';
import handleError from './errors';

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
        title: string,
    });

    // Decoders for nested fields.

    const documentUrlDecoder = record({
        document: record({
            asset: record({
                url: string,
            }),
        }),
    });

    // We combine the base decoder with the decoders
    // for the nested fields, and return the final JSON object.
    // This object is of type Minute.
    return {
        ...baseDecoder(value),
        documentUrl: documentUrlDecoder(value).document.asset.url,
    };
};

// Decode a list of Minute's.
const minuteListDecoder = array(minuteDecoder);

export const MinuteAPI = {
    /**
     * Get the n last meeting minutes.
     * @param n how many meeting minutes to retrieve
     */
    getMinutes: async (): Promise<{ minutes: Array<Minute> | null; error: string | null }> => {
        try {
            const query = `*[_type == "meetingMinute" && !(_id in path('drafts.**'))]{allmote,date,title,document{asset->{url}}}`;
            const data = await SanityAPI.fetch(query);

            return {
                minutes: minuteListDecoder(data),
                error: null,
            };
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                minutes: null,
                error: handleError(axios.isAxiosError(error) ? error.response?.status || 500 : 500),
            };
        }
    },
};
