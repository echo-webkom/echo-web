import { Center, LinkBox, LinkOverlay, Button } from '@chakra-ui/react';
import NextLink from 'next/link';

interface Props {
    text: string;
    linkTo: string;
}

const ButtonLink = ({ text, linkTo }: Props) => {
    return (
        <Center>
            <LinkBox>
                <NextLink href={linkTo} passHref>
                    <LinkOverlay>
                        <Button data-cy="se-mer" colorScheme="teal" mt="1.5rem" fontSize="xl">
                            {text}
                        </Button>
                    </LinkOverlay>
                </NextLink>
            </LinkBox>
        </Center>
    );
};

export default ButtonLink;
