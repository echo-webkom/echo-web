import { z } from 'zod';
import { groq } from 'next-sanity';
import { profileSchema } from './profile';
import SanityAPI from '@api/sanity';
import type { ErrorMessage } from '@utils/error';
import { slugSchema } from '@utils/schemas';

const memberSchema = z.object({
    role: z.string(),
    profile: profileSchema,
});
type Member = z.infer<typeof memberSchema>;

const studentGroupSchema = z.object({
    name: z.string(),
    slug: z.string(),
    info: z.string().nullable(),
    imageUrl: z.string().nullable(),
    members: z
        .array(memberSchema)
        .nullable()
        .transform((m) => m ?? []),
});
type StudentGroup = z.infer<typeof studentGroupSchema>;

const StudentGroupAPI = {
    getPaths: async (): Promise<Array<string>> => {
        try {
            const query = groq`*[_type == "studentGroup"]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return slugSchema
                .array()
                .parse(result)
                .map((nestedSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return [];
        }
    },

    getPathsByType: async (
        type: 'board' | 'suborg' | 'subgroup' | 'intgroup',
    ): Promise<Array<string> | ErrorMessage> => {
        try {
            const query = groq`*[_type == "studentGroup" && groupType == "${type}" && !(_id in path('drafts.**'))]{ "slug": slug.current }`;
            const result = await SanityAPI.fetch(query);

            return slugSchema
                .array()
                .parse(result)
                .map((nestedSlug) => nestedSlug.slug);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },

    getStudentGroupsByType: async (
        type: 'board' | 'suborg' | 'subgroup' | 'intgroup',
    ): Promise<Array<StudentGroup> | ErrorMessage> => {
        try {
            const query = groq`
                *[_type == "studentGroup" && groupType == "${type}" && !(_id in path('drafts.**'))] | order(name) {
                    name,
                    "slug": slug.current,
                    info,
                    "imageUrl": grpPicture.asset -> url,
                    "members": members[] {
                        role,
                        "profile": profile -> {
                            name,
                            "imageUrl": picture.asset -> url
                        }
                    }
                }
            `;
            const result = await SanityAPI.fetch(query);

            return studentGroupSchema.array().parse(result);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },

    getStudentGroupBySlug: async (slug: string): Promise<StudentGroup | ErrorMessage> => {
        try {
            const query = groq`
                *[_type == "studentGroup" && slug.current == "${slug}" && !(_id in path('drafts.**'))] | order(name) {
                    name,
                    "slug": slug.current,
                    info,
                    "imageUrl": grpPicture.asset -> url,
                    "members": members[] {
                        role,
                        "profile": profile -> {
                            name,
                            "imageUrl": picture.asset -> url
                        }
                    }
                }`;
            const result = await SanityAPI.fetch(query);

            if (result.length === 0) {
                return {
                    message: '404',
                };
            }

            return studentGroupSchema.parse(result[0]);
        } catch (error) {
            console.log(error); // eslint-disable-line
            return {
                message: JSON.stringify(error),
            };
        }
    },
};

export { StudentGroupAPI, type Member, type StudentGroup };
