import { Button, Link, LinkBox, LinkOverlay } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

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

interface NavLinkButtonProps {
    children: ReactNode;
    onClick: () => void;
}

export const NavLinkButton = ({ children, onClick }: NavLinkButtonProps) => (
    <Button
        fontSize="3xl"
        textAlign="left"
        fontWeight="light"
        variant="unstyled"
        _hover={{ textDecoration: 'underline' }}
        marginBottom="2rem"
        onClick={onClick}
    >
        {children}
    </Button>
);

export default NavLink;
