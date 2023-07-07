import { Button, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

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
        <Link as={NextLink} href={href} textDecoration={isActive ? 'underline' : ''} data-cy={dataCy}>
            {text}
        </Link>
    );
};

interface NavLinkButtonProps {
    children: React.ReactNode;
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
