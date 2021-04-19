import { Box, Link, Heading, Text, UnorderedList, OrderedList, Code } from '@chakra-ui/react';
import Image from 'next/image';

const MapMarkdownChakra = {
    p: {
        component: Text,
        props: {
            mb: '1em',
        },
    },
    h1: {
        component: Heading,
        props: {
            as: 'h1',
            size: '2xl',
            mt: '20px',
            mb: '10px',
        },
    },
    h2: {
        component: Heading,
        props: {
            as: 'h2',
            size: 'xl',
            mt: '20px',
            mb: '10px',
        },
    },
    h3: {
        component: Heading,
        props: {
            as: 'h3',
            size: 'lg',
            mt: '20px',
            mb: '10px',
        },
    },
    h4: {
        component: Heading,
        props: {
            as: 'h4',
            size: 'md',
            mt: '20px',
            mb: '10px',
        },
    },
    h5: {
        component: Heading,
        props: {
            as: 'h5',
            size: 'sm',
            mt: '20px',
            mb: '10px',
        },
    },
    h6: {
        component: Heading,
        props: {
            as: 'h6',
            size: 'xs',
            mt: '20px',
            mb: '10px',
        },
    },
    blockquote: {
        component: Box,
        props: {
            borderLeftWidth: '0.25em',
            pl: '2em',
            pt: '0.5em',
            pb: '0.5em',
        },
    },
    ul: {
        component: UnorderedList,
        props: {
            pl: '2em',
            mb: '10px',
        },
    },
    ol: {
        component: OrderedList,
        props: {
            pl: '2em',
            mb: '10px',
        },
    },
    code: {
        component: Code,
        props: {
            m: '0.5em',
            pl: '0.5em',
            pr: '0.5em',
        },
    },
    a: {
        component: Link,
        props: {
            isExternal: true,
            color: 'blue',
        },
    },
    img: {
        component: Image,
        props: {
            layout: 'fill',
        },
    },
};

export default MapMarkdownChakra;
