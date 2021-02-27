import { Author } from './author';

export interface Bedpres {
    title: string;
    slug: string;
    date: string;
    spots: number;
    body: string;
    logoUrl: string;
    location: string;
    author: Author;
    companyLink: string;
    registrationLinks: Array<{
        link: string;
        description: string;
    }>;
    publishedAt: string;
    registrationTime: string;
}
