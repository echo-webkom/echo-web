import { Link, LinkBox, LinkOverlay } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface Props {
    href: string;
    text: string;
    testid?: string;
}

const NavLink = ({ href, text, testid }: Props) => {
    const router = useRouter();
    // Router is null with jest testing, so need optional chaining here.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const isActive = router?.pathname === href;

    return (
        <LinkBox data-testid={testid} data-cy="nav-item" mr={['.6rem', null, null, null, '1.5rem']}>
            <NextLink href={href} passHref>
                <LinkOverlay as={Link} textDecoration={isActive ? 'underline' : ''}>
                    {text}
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

export default NavLink;
