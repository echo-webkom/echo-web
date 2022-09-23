interface Title {
    no: string;
    en: string | null;
}

enum Routes {
    Home = '/',
    ForStudents = '/for-studenter',
    ForCompanies = '/for-bedrifter',
    AboutEcho = '/om-echo',
}

interface Route {
    title: Title;
    children: Array<ChildRoute>;
}

interface ChildRoute {
    title: Title;
    path: string;
    children?: Array<ChildRoute>;
}

const routes = [
    {
        title: {
            no: 'For Studenter',
            en: 'For Students',
        },
        children: [
            {
                title: {
                    no: 'Hovedstyret',
                    en: 'Board',
                },
                path: '/for-studenter/hovedstyret',
                children: [
                    {
                        title: {
                            no: '2022-2023',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2022-2023',
                    },
                    {
                        title: {
                            no: '2021-2022',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2021-2022',
                    },
                    {
                        title: {
                            no: '2020-2021',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2020-2021',
                    },
                    {
                        title: {
                            no: '2019-2020',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2019-2020',
                    },
                    {
                        title: {
                            no: '2018-2019',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2018-2019',
                    },
                ],
            },
            {
                title: {
                    no: 'Undergrupper',
                    en: 'Subgroups',
                },
                path: '/for-studenter/undergrupper',
                children: [
                    {
                        title: {
                            no: 'Bedkom 👔',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/bedkom',
                    },
                    {
                        title: {
                            no: 'Gnist ✨',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/gnist',
                    },
                    {
                        title: {
                            no: 'Makerspace 🛠️',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/makerspace',
                    },
                    {
                        title: {
                            no: 'Tilde 🥳',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/tilde',
                    },
                    {
                        title: {
                            no: 'Webkom 💻',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/webkom',
                    },
                ],
            },
            {
                title: {
                    no: 'Underorganisasjoner',
                    en: 'Suborganizations',
                },
                path: '/for-studenter/underorganisasjoner',
                children: [
                    {
                        title: {
                            no: 'programmerbar 🍸',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/programmerbar',
                    },
                    {
                        title: {
                            no: 'echo karriere 🤝',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/echo-karriere',
                    },
                ],
            },
            {
                title: {
                    no: 'Interessegrupper',
                    en: 'Interest Groups',
                },
                path: '/for-studenter/interessegrupper',
                children: [
                    {
                        title: {
                            no: 'filmklubb 🎬',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/echo-filmklubb',
                    },
                    {
                        title: {
                            no: 'buldring 🧗',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/echo-klatring-buldring',
                    },
                    {
                        title: {
                            no: 'squash 🎾',
                            en: null,
                        },

                        path: '/om-echo/studentgrupper/echo-squash',
                    },
                    {
                        title: {
                            no: 'kaffeslabberas ☕',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/echo-kaffeslabberas',
                    },
                    {
                        title: {
                            no: 'bryggelaget 🍺',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/bryggelaget',
                    },
                    {
                        title: {
                            no: 'echo Mages 🪷',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/echo-mages',
                    },
                ],
            },
            {
                title: {
                    no: 'Masterinfo',
                    en: "Master's Info",
                },
                path: '/for-studenter/masterinfo',
            },
            {
                title: {
                    no: 'Økonomisk Støtte',
                    en: 'Financial Support',
                },
                path: '/for-studenter/oekonomisk-stoette',
            },
            {
                title: {
                    no: 'Tilbakemeldinger',
                    en: 'Feedback',
                },
                path: '/for-studenter/anonyme-tilbakemeldinger',
            },
            {
                title: {
                    no: 'Utlegg',
                    en: 'Expenses',
                },
                path: '/for-studenter/utlegg',
            },
        ],
    },
    {
        title: {
            no: 'For Bedrifter',
            en: 'For Companies',
        },
        children: [
            {
                title: {
                    no: 'Bedriftspresentasjon',
                    en: 'Company Presentation',
                },
                path: '/for-bedrifter/bedriftspresentasjon',
            },
            {
                title: {
                    no: 'Stillingsutlysninger',
                    en: 'Job Postings',
                },
                path: '/for-bedrifter/stillingsutlysninger',
            },
        ],
    },
    {
        title: {
            no: 'Om echo',
            en: 'About echo',
        },
        children: [
            {
                title: {
                    no: 'Hvem er vi?',
                    en: 'Who are we?',
                },
                path: '/om-echo/om-oss',
            },
            {
                title: {
                    no: 'Instituttrådet',
                    en: 'The institute council',
                },
                path: '/om-echo/instituttraadet',
            },
            {
                title: {
                    no: 'Vedtekter',
                    en: 'Bylaws',
                },
                path: '/om-echo/vedtekter',
            },
            {
                title: {
                    no: 'Møtereferat',
                    en: 'Minutes',
                },
                path: '/om-echo/moetereferat',
            },
            {
                title: {
                    no: 'Bekk',
                    en: 'Bekk',
                },
                path: '/om-echo/bekk',
            },
        ],
    },
];

export default routes;
export type { Title, Route, ChildRoute, Routes };
