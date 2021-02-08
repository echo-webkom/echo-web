const Queries = {
    nEvents: {
        data: {
            eventCollection: {
                items: [
                    {
                        title: 'Bedpres med Bekk',
                        slug: 'bedpres-med-bekk',
                        date: '2021-01-31T00:00:00.000Z',
                        spots: 30,
                        body:
                            '> Dette blir gøy!\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                        image: {
                            url:
                                'https://images.ctfassets.net/7ygn1zpoiz5r/2WuQ8fCIvoLMUnJ2m77dVr/f10a2f53471732d2289d5d7bd5a06967/bekk.png',
                        },
                        location: 'Store Auditorium -> Keeg Resturant',
                        sys: {
                            firstPublishedAt: '2021-01-21T18:49:29.985Z',
                        },
                        author: {
                            authorName: 'Bo Aanes',
                        },
                    },
                    {
                        title: 'Halloweenfest på lesesalen',
                        slug: 'halloweenfest-pa-lesesalen',
                        date: '2021-04-22T00:00:00.000Z',
                        spots: 45,
                        body: 'blasdfkjasldkfjasldkfj\n\n> Quote\n\n**Hallo**',
                        image: {
                            url:
                                'https://images.ctfassets.net/7ygn1zpoiz5r/2WuQ8fCIvoLMUnJ2m77dVr/f10a2f53471732d2289d5d7bd5a06967/bekk.png',
                        },
                        location: 'Lesesalen',
                        sys: {
                            firstPublishedAt: '2021-01-25T09:44:56.339Z',
                        },
                        author: {
                            authorName: 'Bo Aanes',
                        },
                    },
                ],
            },
        },
    },
    eventBySlug: {
        data: {
            eventCollection: {
                items: [
                    {
                        title: 'Bedpres med Bekk',
                        slug: 'bedpres-med-bekk',
                        date: '2021-01-31T00:00:00.000Z',
                        spots: 30,
                        body:
                            '> Dette blir gøy!\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                        image: {
                            url:
                                'https://images.ctfassets.net/7ygn1zpoiz5r/2WuQ8fCIvoLMUnJ2m77dVr/f10a2f53471732d2289d5d7bd5a06967/bekk.png',
                        },
                        location: 'Store Auditorium -> Keeg Resturant',
                        sys: {
                            firstPublishedAt: '2021-01-21T18:49:29.985Z',
                        },
                        author: {
                            authorName: 'Bo Aanes',
                        },
                    },
                ],
            },
        },
    },
    eventPaths: {
        data: {
            eventCollection: {
                items: [
                    {
                        slug: 'bedpres-med-bekk',
                    },
                    {
                        slug: 'halloweenfest-pa-lesesalen',
                    },
                ],
            },
        },
    },
    postPaths: {
        data: {
            postCollection: {
                items: [
                    {
                        slug: 'alle-ma-ha-hjemmekontor',
                    },
                    {
                        slug: 'post-mcpost',
                    },
                    {
                        slug: 'test-mctest',
                    },
                    {
                        slug: 'pal-er-sot',
                    },
                    {
                        slug: 'elias-er-smud-ass',
                    },
                    {
                        slug: 'bedriftspresentasjon-med-cognite-hosten-2020',
                    },
                ],
            },
        },
    },
    nPosts: {
        data: {
            postCollection: {
                items: [
                    {
                        title: 'Alle må ha hjemmekontor',
                        slug: 'alle-ma-ha-hjemmekontor',
                        body: 'Dette er nytt\n\n`print(hello)`\n\nHeisann hoppsann',
                        author: {
                            authorName: 'Bo Aanes',
                        },
                        sys: {
                            firstPublishedAt: '2020-11-12T11:28:50.368Z',
                        },
                    },
                    {
                        title: 'Post McPost',
                        slug: 'post-mcpost',
                        body:
                            'Desverre må alle nå ha hjemmekontor, ja det er kjipt.\n\n    print("det var dumt")\n\n>"Alle må være hjemme" -Staten\n\n* Det er kjipt\n* Veldig kjipt\n\n1. Grunn nr. 1\n2. Grunn nr. 2\n\nMeld deg av hjemmekontor [her](https://uib.no/)',
                        author: {
                            authorName: 'Bo Aanes',
                        },
                        sys: {
                            firstPublishedAt: '2020-11-11T22:50:28.992Z',
                        },
                    },
                    {
                        title: 'Test McTest',
                        slug: 'test-mctest',
                        body: '> Of TestMcTest',
                        author: {
                            authorName: 'Bo Aanes',
                        },
                        sys: {
                            firstPublishedAt: '2020-11-24T15:38:21.021Z',
                        },
                    },
                    {
                        title: 'Pål er søt',
                        slug: 'pal-er-sot',
                        body: '> "Jeg er søt" -Pål\nasdfasdfasdfasdf\n\n* snakkes hello there',
                        author: {
                            authorName: 'Bo Aanes',
                        },
                        sys: {
                            firstPublishedAt: '2020-11-24T13:41:11.641Z',
                        },
                    },
                ],
            },
        },
    },
    postBySlug: {
        data: {
            postCollection: {
                items: [
                    {
                        title: 'Alle må ha hjemmekontor',
                        slug: 'alle-ma-ha-hjemmekontor',
                        body: 'Dette er nytt\n\n`print(hello)`\n\nHeisann hoppsann',
                        author: {
                            authorName: 'Bo Aanes',
                        },
                        sys: {
                            firstPublishedAt: '2020-11-12T11:28:50.368Z',
                        },
                    },
                ],
            },
        },
    },
};

export default Queries;
