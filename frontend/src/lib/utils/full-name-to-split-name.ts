const fullNameToSplitName = (name: string) => {
    const [firstName, ...lastNameArray] = name.split(' ');

    return [firstName, lastNameArray.join(' ')];
};

export default fullNameToSplitName;
