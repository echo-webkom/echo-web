import { Author } from './author';

export interface Event {
    title: string;
    slug: string;
    date: string;
    spots: number;
    body: string;
    imageUrl: string;
    publishedAt: string;
    author: Author;
}
