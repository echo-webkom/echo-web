export default {
  name: 'author',
  title: 'Author',
  description:
    'Den som har publisert innholder (bedpres, post, event, osv...). Navn på undergruppe er foretrukket.',
  type: 'document',
  preview: {
    select: {
      title: 'authorName'
    }
  },
  fields: [
    {
      name: 'authorName',
      title: 'Author Name',
      validation: Rule => Rule.required(),
      type: 'string'
    }
  ]
}
