/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line import/exports-last
export const config = {
    runtime: 'edge',
};

// eslint-disable-next-line unicorn/prefer-top-level-await
const font = fetch(new URL('../../../assets/BebasNeue-Regular.ttf', import.meta.url)).then((res) => res.arrayBuffer());

export default async function OGImage(req: NextRequest) {
    try {
        const fontData = await font;

        const { searchParams } = new URL(req.url);

        const title = searchParams.get('title') ?? 'Bedrift';
        const logoUrl = searchParams.get('logoUrl') ?? '../../../assets/small-echo-logo.png';

        const isLongTitle = title.length >= 13;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new ImageResponse(
            (
                <div
                    style={{
                        color: 'black',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        background: 'linear-gradient(45deg, #008094 0%, #a6cfd9 50%, #fcbf00 100%)',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '90%',
                            height: '90%',
                            display: 'flex',
                            background: 'white',
                            boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '35%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 50,
                                alignItems: 'center',
                            }}
                        >
                            <img src="https://echo.uib.no/android-chrome-512x512.png" width={300} />
                            <p style={{ fontSize: 120 }}>🤝</p>
                            <img src={logoUrl} width={300} />
                        </div>
                        <p
                            style={{
                                position: 'absolute',
                                display: 'flex',
                                flexDirection: isLongTitle ? 'column' : 'row',
                                gap: 15,
                                bottom: '0%',
                                left: '50%',
                                transform: `translate(-50%, ${isLongTitle ? '0' : '-20'}%)`,
                                fontSize: isLongTitle ? 80 : 110,
                                fontFamily: '"Bebas Neue"',
                            }}
                        >
                            <span tw="mx-auto">Bedpres med</span>
                            <span tw="mx-auto">{title}</span>
                        </p>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                emoji: 'noto',
                fonts: [
                    {
                        name: 'Bebas Neue',
                        data: fontData,
                        style: 'normal',
                    },
                ],
            },
        );
    } catch {
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
