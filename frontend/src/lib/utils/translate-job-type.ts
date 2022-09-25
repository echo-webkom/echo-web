const translateJobType = (
    jobType: 'fulltime' | 'parttime' | 'internship' | 'summerjob',
    isNorwegian: boolean = true,
): string => {
    switch (jobType) {
        case 'fulltime':
            return isNorwegian ? 'Fulltid' : 'Full time';
        case 'parttime':
            return isNorwegian ? 'Deltid' : 'Part time';
        case 'internship':
            return 'Internship';
        case 'summerjob':
            return isNorwegian ? 'Sommerjobb' : 'Summer internship';
    }
};

export default translateJobType;
