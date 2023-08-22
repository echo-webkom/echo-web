import type { Degree } from '@utils/schemas';

const allDegrees: Array<Degree> = [
    'DTEK',
    'DSIK',
    'DVIT',
    'BINF',
    'IMO',
    'IKT',
    'KOGNI',
    'INF',
    'PROG',
    'ARMNINF',
    'POST',
    'MISC',
    'DSC',
];

const feideDegreeGroupPrefix = 'fc:fs:fs:prg:uib.no:';

const degreeToFeideGroup = (degree: Degree): string | null => {
    switch (degree) {
        case 'DTEK': {
            return feideDegreeGroupPrefix + 'BAMN-DTEK';
        }
        case 'DSIK': {
            return feideDegreeGroupPrefix + 'BAMN-DSIK';
        }
        case 'DVIT': {
            return feideDegreeGroupPrefix + 'BAMN-DVIT';
        }
        case 'BINF': {
            return feideDegreeGroupPrefix + 'BAMN-BINF';
        }
        case 'IMO': {
            return feideDegreeGroupPrefix + 'BATF-IMØ';
        }
        case 'INF': {
            return feideDegreeGroupPrefix + 'MAMN-INF';
        }
        case 'PROG': {
            return feideDegreeGroupPrefix + 'MAMN-PROG';
        }
        case 'ARMNINF': {
            return feideDegreeGroupPrefix + 'ÅRMN-INF';
        }
        case 'DSC': {
            return feideDegreeGroupPrefix + '5MAMN-DSC';
        }
        case 'POST': {
            return feideDegreeGroupPrefix + 'POST';
        }
        default: {
            return null;
        }
    }
};

const allValidDegrees: Array<Degree> = allDegrees.filter((degree) => degreeToFeideGroup(degree) !== null);

const allValidFeideGroups: Array<string> = allValidDegrees.reduce((acc, degree) => {
    const feideGroup = degreeToFeideGroup(degree);
    if (feideGroup !== null) {
        acc.push(feideGroup);
    }
    return acc;
}, [] as Array<string>);

export { allDegrees, allValidDegrees, allValidFeideGroups, degreeToFeideGroup };
