import { formatISO, isPast, parseISO, sub } from 'date-fns';
import { Bedpres } from './api/bedpres';
import { Event } from './api/event';
import { Post } from './api/post';

type GenericEntry = {
    slug: string;
    title: string;
    publishedAt: string;
    author: string;
    body: string;
    route: string;
};

const generatePosts = (posts: Array<GenericEntry>): { postsXML: string; latestPostDate: Date } => {
    let latestPostDate = new Date(0);
    let postsXML = '';

    posts.forEach((post) => {
        const date = new Date(post.publishedAt);

        if (!latestPostDate || date > latestPostDate) latestPostDate = date;

        postsXML += `
            <item>
                <title><![CDATA[${post.title}]]></title>
                <link>https://echo.uib.no/${post.route}/${post.slug}</link>
                <dc:creator><![CDATA[${post.author}]]></dc:creator>
                <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
                <guid isPermalink="false">https://echo.uib.no/posts/${post.slug}</guid>
                <description>
                    <![CDATA[${post.body.slice(0, 70)} ...]]>
                </description>
                <content>
                    <![CDATA[${post.body}]]>
                </content>
            </item>
        `;
    });

    return {
        postsXML,
        latestPostDate,
    };
};

const getRssXML = (
    posts: Array<Post> | null,
    events: Array<Event> | null,
    bedpreses: Array<Bedpres> | null,
): string => {
    const genericPosts = posts
        ? posts.map((post) => {
              return {
                  slug: post.slug,
                  title: post.title,
                  publishedAt: post._createdAt,
                  author: post.author,
                  body: post.body,
                  route: 'posts',
              };
          })
        : [];

    const genericEvents = events
        ? events.map((event) => {
              return {
                  slug: event.slug,
                  title: event.title,
                  publishedAt: event._createdAt,
                  author: event.author,
                  body: event.body,
                  route: 'events',
              };
          })
        : [];

    const genericBedpreses = bedpreses
        ? bedpreses
              .filter((bedpres) => isPast(sub(parseISO(bedpres.registrationTime), { hours: 12 })))
              .map((bedpres) => {
                  return {
                      slug: bedpres.slug,
                      title: bedpres.title,
                      publishedAt: formatISO(sub(parseISO(bedpres.registrationTime), { hours: 12 })),
                      author: bedpres.author,
                      body: bedpres.body,
                      route: 'bedpres',
                  };
              })
        : [];

    const all = genericPosts.concat(genericEvents).concat(genericBedpreses);
    all.sort((a, b) => {
        if (new Date(a.publishedAt) < new Date(b.publishedAt)) return 1;
        if (new Date(b.publishedAt) < new Date(a.publishedAt)) return -1;
        return 0;
    });

    const { postsXML, latestPostDate } = generatePosts(all);

    return `<?xml version="1.0" ?>
        <rss
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:content="http://purl.org/rss/1.0/modules/content/"
            xmlns:atom="http://www.w3.org/2005/Atom"
            version="2.0"
        >
            <channel>
                <title><![CDATA[echo – Fagutvalget for informatikk]]></title>
                <link>https://echo.uib.no/</link>
                <description></description>
                <language>en-US</language>
                <lastBuildDate>${latestPostDate.toUTCString()}</lastBuildDate>
                    ${postsXML}
            </channel>
        </rss>
    `;
};

export default getRssXML;
