import { z } from 'zod';

const slugSchema = z.object({
    slug: z.string(),
});
type Slug = z.infer<typeof slugSchema>;

const degreeSchema = z.enum([
    'DTEK',
    'DSIK',
    'DVIT',
    'BINF',
    'IMO',
    // IKT and KOGNI should not be used,
    // are only here for backwards compatibility.
    'IKT',
    'KOGNI',
    //
    'INF',
    'PROG',
    'ARMNINF',
    'POST',
    'MISC',
]);
type Degree = z.infer<typeof degreeSchema>;

export { slugSchema, degreeSchema, type Degree, type Slug };
