import { Entry } from 'contentful';

declare module '*.png' {
    const value: string;
    export = value;
}

interface AuthorFields {
    name: string;
}

interface PostFields {
    title: string;
    slug: string;
    body: string;
    publishedDate: string;
    author: Author;
}

export type Post = Entry<PostFields>;

export type Author = Entry<AuthorFields>;
