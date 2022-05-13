const authorColors: { [group: string]: string } = {
    strikkeklubben: '#e67e22',
    heltsikker: '#222',
    'gnist x filmklubb': '#333',
    jarletheman: '#444',
    'echo buldring/klatring': '#555',
    bryggelaget: '#666',
    programmerbar: '#777',
    makerspace: '#888',
    'echo karriere': '#999',
    webkom: '#aaa',
    'echo hovedstyret': '#bbb',
    gnist: 'cyan.500',
    bedkom: '#811',
    tilde: '#191',
};

const getAuthorColor = (author: string) => {
    author = author.toLowerCase();
    return authorColors[author];
};

export default getAuthorColor;
