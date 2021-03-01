import React from 'react';
import { GetStaticProps } from 'next';

import Layout from '../components/layout';
import SEO from '../components/seo';
import EventBlock from '../components/event-block';
import PostBlock from '../components/post-block';
import { Event, Post } from '../lib/types';
import EventAPI from '../lib/api/event';
import PostAPI from '../lib/api/post';

const IndexPage = ({ events, posts }: { events: Array<Event>; posts: Array<Post> }): JSX.Element => (
    <Layout>
        <SEO title="Home" />
        <PostBlock posts={posts} />
        <EventBlock events={events} />
    </Layout>
);

export const getStaticProps: GetStaticProps = async () => {
    try {
        const { events } = await EventAPI.getEvents(3);
        const { posts } = await PostAPI.getPosts(2);

        return {
            props: {
                events,
                posts,
            },
        };
    } catch (error) {
        return {
            props: {
                posts: [],
                events: [],
            },
        };
    }
};

export default IndexPage;
