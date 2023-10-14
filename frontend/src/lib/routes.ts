interface TopLevelRoute {
    name: string;
    items: Array<MenuItem>;
}

type MenuItem =
    | {
          name: string;
          href: string;
      }
    | TopLevelRoute;

const sidebarRoutes: Array<TopLevelRoute> = [
    {
        name: 'Om echo',
        items: [
            { name: 'Hvem er vi?', href: '/om-echo/om-oss' },
            { name: 'Instituttrådet', href: '/om-echo/instituttraadet' },
            { name: 'Vedtekter', href: '/om-echo/vedtekter' },
            { name: 'Møtereferat', href: '/om-echo/moetereferat' },
            { name: 'Bekk', href: '/om-echo/bekk' },
        ],
    },
    {
        name: 'For Studenter',
        items: [
            {
                name: 'Hovedstyret',
                items: [
                    { name: '2023-2024', href: '/om-echo/studentgrupper/2023-2024' },
                    { name: '2022-2023', href: '/om-echo/studentgrupper/2022-2023' },
                    { name: '2021-2022', href: '/om-echo/studentgrupper/2021-2022' },
                    { name: '2020-2021', href: '/om-echo/studentgrupper/2020-2021' },
                    { name: '2019-2020', href: '/om-echo/studentgrupper/2019-2020' },
                    { name: '2018-2019', href: '/om-echo/studentgrupper/2018-2019' },
                    { name: '2017-2018', href: '/om-echo/studentgrupper/2017-2018' },
                    { name: '2016-2017', href: '/om-echo/studentgrupper/2016-2017' },
                    { name: '2015-2016', href: '/om-echo/studentgrupper/2015-2016' },
                    { name: '2014-2015', href: '/om-echo/studentgrupper/2014-2015' },
                    { name: '2013-2014', href: '/om-echo/studentgrupper/2013-2014' },
                    { name: '2012-2013', href: '/om-echo/studentgrupper/2012-2013' },
                    { name: '2011-2012', href: '/om-echo/studentgrupper/2011-2012' },
                    { name: '2010-2011', href: '/om-echo/studentgrupper/2010-2011' },
                ],
            },
            {
                name: 'Undergrupper',
                items: [
                    { name: 'Bedkom 👔', href: '/om-echo/studentgrupper/bedkom' },
                    { name: 'Gnist ✨', href: '/om-echo/studentgrupper/gnist' },
                    { name: 'Makerspace 🛠️', href: '/om-echo/studentgrupper/makerspace' },
                    { name: 'Tilde 🥳', href: '/om-echo/studentgrupper/tilde' },
                    { name: 'Webkom 💻', href: '/om-echo/studentgrupper/webkom' },
                    { name: 'Hyggkom 🫶', href: '/om-echo/studentgrupper/hyggkom' },
                    { name: 'ESC 🏟️', href: '/om-echo/studentgrupper/esc' },
                ],
            },
            {
                name: 'Underorganisasjoner',
                items: [{ name: 'programmerbar 🍸', href: '/om-echo/studentgrupper/programmerbar' }],
            },
            {
                name: 'Interessegrupper',
                items: [
                    { name: 'filmklubb 🎬', href: '/om-echo/studentgrupper/echo-filmklubb' },
                    { name: 'buldring 🧗', href: '/om-echo/studentgrupper/echo-klatring-buldring' },
                    { name: 'squash 🎾', href: '/om-echo/studentgrupper/echo-squash' },
                    { name: 'kaffeslabberas ☕', href: '/om-echo/studentgrupper/echo-kaffeslabberas' },
                    { name: 'bryggelaget 🍺', href: '/om-echo/studentgrupper/bryggelaget' },
                    { name: 'echo Mages 🪷', href: '/om-echo/studentgrupper/echo-mages' },
                    { name: 'echo Brettspill 🎲', href: '/om-echo/studentgrupper/echo-brettspill' },
                    { name: 'echo Informatikkband 🎶', href: '/om-echo/studentgrupper/echo-informatikkband' },
                ],
            },
            { name: 'Masterinfo', href: '/om-echo/masterinfo' },
            { name: 'Økonomisk støtte', href: '/om-echo/oekonomisk-stoette' },
            { name: 'Tilbakemeldinger', href: '/om-echo/anonyme-tilbakemeldinger' },
            { name: 'Utlegg', href: '/om-echo/utlegg' },
            { name: 'Si ifra', href: '/om-echo/si-ifra' },
            { name: 'Brosjyre', href: '/om-echo/brosjyre' },
        ],
    },
    {
        name: 'For Bedrifter',
        items: [
            { name: 'Bedriftspresentasjon', href: '/om-echo/bedriftspresentasjon' },
            { name: 'Stillingsutlysninger', href: '/om-echo/stillingsutlysninger' },
        ],
    },
];

export { sidebarRoutes, type TopLevelRoute, type MenuItem };
