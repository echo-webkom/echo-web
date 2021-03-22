import { Minute } from '../types';
import API from './api';
import { GET_N_MINUTES } from './schema';

const MinuteAPI = {
    getMinutes: async (n: number): Promise<{ minutes: Array<Minute> | null; error: string | null }> => {
        try {
            const { data } = await API.post('', {
                query: GET_N_MINUTES,
                variables: {
                    n,
                },
            });

            return {
                minutes: data.data.meetingMinuteCollection.items.map(
                    (minute: {
                        date: string;
                        document: {
                            url: string;
                        };
                        allmote: boolean;
                    }) => {
                        return {
                            date: minute.date,
                            document: minute.document.url,
                            allmote: minute.allmote,
                        };
                    },
                ),
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

export default MinuteAPI;
