export default {
  name: 'registrationLink',
  title: 'Registration Link',
  description: 'Påmeldingslink til bedriftspresentasjoner',
  type: 'document',
  preview: {
    select: {
      title: 'link'
    }
  },
  fields: [
    {
      name: 'link',
      title: 'Link',
      validation: Rule => Rule.required(),
      type: 'url'
    },
    {
      name: 'description',
      title: 'Description',
      validation: Rule => Rule.required(),
      type: 'string'
    }
  ]
}
