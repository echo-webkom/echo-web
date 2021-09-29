export default {
    name: 'portableText',
    type: 'array',
    title: 'Rich text',
    of: [
        {
            type: 'block',
            of: [
                {
                    type: 'image',
                },
                {
                    type: 'reference',
                    to: [
                        {
                            type: 'author',
                        },
                        {
                            type: 'post',
                        },
                        {
                            type: 'event',
                        },
                        {
                            type: 'bedpres',
                        },
                        {
                            type: 'meetingMinute',
                        },
                        {
                            type: 'profile',
                        },
                        {
                            type: 'role',
                        },
                        {
                            type: 'studentGroup',
                        },
                        {
                            type: 'additionalQuestion',
                        },
                    ],
                },
            ],
            styles: [
                {
                    title: 'Normal text',
                    value: 'normal',
                },
                {
                    title: 'Heading 1',
                    value: 'h1',
                },
                {
                    title: 'Heading 2',
                    value: 'h2',
                },
                {
                    title: 'Heading 3',
                    value: 'h3',
                },
                {
                    title: 'Heading 4',
                    value: 'h4',
                },
                {
                    title: 'Heading 5',
                    value: 'h5',
                },
                {
                    title: 'Heading 6',
                    value: 'h6',
                },
                {
                    title: 'Quote',
                    value: 'blockquote',
                },
            ],
            marks: {
                annotations: [
                    {
                        name: 'link',
                        type: 'object',
                        title: 'URL',
                        fields: [
                            {
                                title: 'URL',
                                name: 'href',
                                type: 'url',
                            },
                        ],
                    },
                    {
                        type: 'image',
                    },
                    {
                        type: 'reference',
                        to: [
                            {
                                type: 'author',
                            },
                            {
                                type: 'post',
                            },
                            {
                                type: 'event',
                            },
                            {
                                type: 'bedpres',
                            },
                            {
                                type: 'meetingMinute',
                            },
                            {
                                type: 'profile',
                            },
                            {
                                type: 'role',
                            },
                            {
                                type: 'studentGroup',
                            },
                            {
                                type: 'additionalQuestion',
                            },
                        ],
                    },
                ],
            },
        },
        {
            type: 'break',
        },
        {
            type: 'image',
        },
        {
            type: 'reference',
            to: [
                {
                    type: 'author',
                },
                {
                    type: 'post',
                },
                {
                    type: 'event',
                },
                {
                    type: 'bedpres',
                },
                {
                    type: 'meetingMinute',
                },
                {
                    type: 'profile',
                },
                {
                    type: 'role',
                },
                {
                    type: 'studentGroup',
                },
                {
                    type: 'additionalQuestion',
                },
            ],
        },
    ],
};
