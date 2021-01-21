import { Author } from './author';

export interface Post {
    title: string;
    slug: string;
    body: string;
    publishedAt: string;
    author: Author;
}
