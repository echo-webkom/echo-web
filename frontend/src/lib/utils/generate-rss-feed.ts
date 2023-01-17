import { formatISO, isPast, parseISO, sub } from 'date-fns';
import type { Happening } from '@api/happening';
import type { Post } from '@api/post';

interface GenericEntry {
    slug: string;
    title: string | { no: string; en?: string | undefined };
    publishedAt: string;
    author: string;
    body: string | { no: string; en?: string | undefined };
    route: string;
}

const generatePosts = (posts: Array<GenericEntry>): { postsXML: string; latestPostDate: Date } => {
    let latestPostDate = new Date(0);
    let postsXML = '';

    for (const post of posts) {
        const date = new Date(post.publishedAt);
        const title = typeof post.title === 'string' ? post.title : post.title.no;
        const body = typeof post.body === 'string' ? post.body : post.body.no;

        if (date > latestPostDate) latestPostDate = date;

        postsXML += `
            <item>
                <title><![CDATA[${title}]]></title>
                <link>https://echo.uib.no/${post.route}/${post.slug}</link>
                <dc:creator><![CDATA[${post.author}]]></dc:creator>
                <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
                <guid isPermalink="false">https://echo.uib.no/posts/${post.slug}</guid>
                <description>

                    <![CDATA[${body.slice(0, 70)} ...]]>
                </description>
                <content>
                    <![CDATA[${body}]]>
                </content>
            </item>
        `;
    }

    return {
        postsXML,
        latestPostDate,
    };
};

const getRssXML = (posts: Array<Post> | null, happenings: Array<Happening> | null): string => {
    const genericPosts = posts
        ? posts.map((post) => {
              return {
                  slug: post.slug,
                  title: typeof post.title === 'string' ? post.title : post.title.no,
                  publishedAt: post._createdAt,
                  author: post.author,
                  body: typeof post.body === 'string' ? post.body : post.body.no,
                  route: 'posts',
              };
          })
        : [];

    const happeningIsPast = (happening: Happening) => {
        if (!happening.registrationDate) return false;
        return isPast(sub(parseISO(happening.registrationDate), { hours: 12 }));
    };

    const genericHappenings = happenings
        ? happenings
              .filter((pred) => happeningIsPast(pred))
              .map((happening) => {
                  return {
                      slug: happening.slug,
                      title: happening.title,
                      publishedAt: formatISO(
                          sub(parseISO(happening.registrationDate ?? new Date().toString()), { hours: 12 }),
                      ),
                      author: happening.studentGroupName,
                      body: happening.body,
                      route: happening.happeningType.toLowerCase(),
                  };
              })
        : [];

    const all = [...genericPosts, ...genericHappenings];
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
                <title><![CDATA[echo – Linjeforeningen for informatikk]]></title>
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
