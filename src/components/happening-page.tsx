import { useTimeout } from '@chakra-ui/react';
import { differenceInMilliseconds, formatISO, parseISO } from 'date-fns';
import { useRouter } from 'next/router';
import React from 'react';
import { Happening, SpotRangeCount } from '../lib/api';
import ErrorBox from './error-box';
import HappeningUI from './happening';
import SEO from './seo';

interface Props {
    happening: Happening | null;
    backendUrl: string;
    spotRangeCounts: Array<SpotRangeCount> | null;
    date: number;
    error: string | null;
}

const HappeningPage = ({ happening, backendUrl, spotRangeCounts, date, error }: Props): JSX.Element => {
    const router = useRouter();
    const regDate = parseISO(happening?.registrationDate ?? formatISO(new Date()));
    const time =
        !happening ||
        differenceInMilliseconds(regDate, date) < 0 ||
        differenceInMilliseconds(regDate, date) > 172_800_000
            ? null
            : differenceInMilliseconds(regDate, date);

    useTimeout(() => {
        if (happening?.registrationDate) void router.replace(router.asPath, undefined, { scroll: false });
    }, time);

    return (
        <>
            {error && !happening && <ErrorBox error={error} />}
            {happening && !error && (
                <>
                    <SEO title={happening.title} />
                    <HappeningUI
                        happening={happening}
                        backendUrl={backendUrl}
                        spotRangeCounts={spotRangeCounts}
                        date={date}
                    />
                </>
            )}
        </>
    );
};

export default HappeningPage;
