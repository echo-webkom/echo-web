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
    path: string | null;
    dataCy: string;
    children: Array<ChildRoute> | null;
}

interface ChildRoute {
    title: Title;
    path: string | null;
    children: Array<ChildRoute> | null;
}

const routes: Array<Route> = [
    {
        title: {
            no: 'Hjem',
            en: 'Home',
        },
        path: '/',
        dataCy: 'home',
        children: null,
    },
    {
        title: {
            no: 'For Studenter',
            en: 'For Students',
        },
        dataCy: 'for-students',
        path: null,
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
                        children: null,
                    },
                    {
                        title: {
                            no: '2021-2022',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2021-2022',
                        children: null,
                    },
                    {
                        title: {
                            no: '2020-2021',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2020-2021',
                        children: null,
                    },
                    {
                        title: {
                            no: '2019-2020',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2019-2020',
                        children: null,
                    },
                    {
                        title: {
                            no: '2018-2019',
                            en: null,
                        },
                        path: '/for-studenter/studentgrupper/2018-2019',
                        children: null,
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
                        children: null,
                    },
                    {
                        title: {
                            no: 'Gnist ✨',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/gnist',
                        children: null,
                    },
                    {
                        title: {
                            no: 'Makerspace 🛠️',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/makerspace',
                        children: null,
                    },
                    {
                        title: {
                            no: 'Tilde 🥳',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/tilde',
                        children: null,
                    },
                    {
                        title: {
                            no: 'Webkom 💻',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/webkom',
                        children: null,
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
                        children: null,
                    },
                    {
                        title: {
                            no: 'echo karriere 🤝',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/echo-karriere',
                        children: null,
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
                        children: null,
                    },
                    {
                        title: {
                            no: 'buldring 🧗',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/echo-klatring-buldring',
                        children: null,
                    },
                    {
                        title: {
                            no: 'squash 🎾',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/echo-squash',
                        children: null,
                    },
                    {
                        title: {
                            no: 'kaffeslabberas ☕',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/echo-kaffeslabberas',
                        children: null,
                    },
                    {
                        title: {
                            no: 'bryggelaget 🍺',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/bryggelaget',
                        children: null,
                    },
                    {
                        title: {
                            no: 'echo Mages 🪷',
                            en: null,
                        },
                        path: '/om-echo/studentgrupper/echo-mages',
                        children: null,
                    },
                ],
            },
            {
                title: {
                    no: 'Masterinfo',
                    en: "Master's Info",
                },
                path: '/for-studenter/masterinfo',
                children: null,
            },
            {
                title: {
                    no: 'Økonomisk Støtte',
                    en: 'Financial Support',
                },
                path: '/for-studenter/oekonomisk-stoette',
                children: null,
            },
            {
                title: {
                    no: 'Tilbakemeldinger',
                    en: 'Feedback',
                },
                path: '/for-studenter/anonyme-tilbakemeldinger',
                children: null,
            },
            {
                title: {
                    no: 'Utlegg',
                    en: 'Expenses',
                },
                path: '/for-studenter/utlegg',
                children: null,
            },
        ],
    },
    {
        title: {
            no: 'For Bedrifter',
            en: 'For Companies',
        },
        dataCy: 'for-companies',
        path: null,
        children: [
            {
                title: {
                    no: 'Bedriftspresentasjon',
                    en: 'Company Presentation',
                },
                path: '/for-bedrifter/bedriftspresentasjon',
                children: null,
            },
            {
                title: {
                    no: 'Stillingsutlysninger',
                    en: 'Job Postings',
                },
                path: '/for-bedrifter/stillingsutlysninger',
                children: null,
            },
        ],
    },
    {
        title: {
            no: 'Om echo',
            en: 'About echo',
        },
        dataCy: 'about-echo',
        path: null,
        children: [
            {
                title: {
                    no: 'Hvem er vi?',
                    en: 'Who are we?',
                },
                path: '/om-echo/om-oss',
                children: null,
            },
            {
                title: {
                    no: 'Instituttrådet',
                    en: 'The institute council',
                },
                path: '/om-echo/instituttraadet',
                children: null,
            },
            {
                title: {
                    no: 'Vedtekter',
                    en: 'Bylaws',
                },
                path: '/om-echo/vedtekter',
                children: null,
            },
            {
                title: {
                    no: 'Møtereferat',
                    en: 'Minutes',
                },
                path: '/om-echo/moetereferat',
                children: null,
            },
            {
                title: {
                    no: 'Bekk',
                    en: 'Bekk',
                },
                path: '/om-echo/bekk',
                children: null,
            },
        ],
    },
];

export default routes;
export type { Title, Route, Routes };
