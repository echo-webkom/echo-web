import { Button, Center, LinkBox, LinkOverlay } from '@chakra-ui/react';
import NextLink from 'next/link';

interface Props {
    text: string;
    linkTo: string;
}

const ButtonLink = ({ text, linkTo }: Props): JSX.Element => {
    return (
        <Center>
            <LinkBox data-cy="button-link">
                <NextLink href={linkTo} passHref>
                    <LinkOverlay>
                        <Button colorScheme="teal" mt="1.5rem" fontSize="xl">
                            {text}
                        </Button>
                    </LinkOverlay>
                </NextLink>
            </LinkBox>
        </Center>
    );
};

export default ButtonLink;
