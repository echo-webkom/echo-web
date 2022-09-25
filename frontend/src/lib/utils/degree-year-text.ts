const degreeYearTag = (degreeYears: Array<number>, isNorwegian: boolean = true): string => {
    if (degreeYears.length === 1) {
        const year = degreeYears[0];

        if (isNorwegian) {
            return `${String(year)}. trinn`;
        }

        return `${String(year)}${ordinalSuffix(year)} year`;
    }

    if (degreeYears.length > 0 && degreeYears.length < 5) {
        if (isNorwegian) {
            return `${String(degreeYears.sort().slice(0, -1).join(', '))} og ${String(degreeYears.slice(-1))} . trinn`;
        }

        // Take into account ordinal suffixes
        const years = degreeYears.sort().map((year) => `${String(year)}${ordinalSuffix(year)}`);

        return `${years.slice(0, -1).join(', ')} and ${String(years.slice(-1))} year`;
    }

    return isNorwegian ? 'Alle trinn' : 'All years';
};

const ordinalSuffix = (i: number): string => {
    const j = i % 10;
    const k = i % 100;

    if (j === 1 && k !== 11) {
        return 'st';
    }

    if (j === 2 && k !== 12) {
        return 'nd';
    }

    if (j === 3 && k !== 13) {
        return 'rd';
    }

    return 'th';
};

export default degreeYearTag;
