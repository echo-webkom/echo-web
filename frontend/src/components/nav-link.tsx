import { Button, Link, LinkBox, LinkOverlay } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

interface Props {
    href: string;
    text: string;
    'data-cy'?: string;
}

const NavLink = ({ href, text, 'data-cy': dataCy }: Props) => {
    const router = useRouter();
    // Router is null with jest testing, so need optional chaining here.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const isActive = router?.pathname === href;

    return (
        <LinkBox data-cy={dataCy} mr={['.6rem', null, null, null, '1.5rem']}>
            <NextLink href={href} passHref>
                <LinkOverlay as={Link} textDecoration={isActive ? 'underline' : ''}>
                    {text}
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

interface NavLinkButtonProps {
    children: ReactNode;
    onClick: () => void;
}

export const NavLinkButton = ({ children, onClick }: NavLinkButtonProps) => (
    <Button
        fontSize={['3xl', null, null, 'lg', '2xl']}
        textAlign="left"
        fontWeight="light"
        variant="unstyled"
        _hover={{ textDecoration: 'underline' }}
        mb={['1.5rem', null, null, '0']}
        mr={['.6rem', null, null, null, '1.5rem']}
        onClick={onClick}
    >
        {children}
    </Button>
);

export default NavLink;
