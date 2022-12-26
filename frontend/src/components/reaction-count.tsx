import { useEffect, useState } from 'react';
import { Flex, Text, Center } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { CiHeart } from 'react-icons/ci';
import ReactionAPI from '@api/reaction';
import { isErrorMessage } from '@utils/error';
import useAuth from '@hooks/use-auth';

interface Props extends BoxProps {
    slug: string;
    size?: number;
    fontSize?: string;
}

const ReactionCount = ({ slug, size = 20, fontSize = '18px', ...props }: Props) => {
    const { signedIn, idToken } = useAuth();

    const [reactCount, setReactCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchReactions = async () => {
            if (!signedIn || !idToken) return;

            const result = await ReactionAPI.get(slug, idToken);

            if (isErrorMessage(result)) {
                return;
            }

            const count = result.like + result.rocket + result.beer + result.eyes + result.fix;
            setReactCount(count);
        };

        void fetchReactions();
    }, [signedIn, idToken, slug]);

    if (reactCount === null) {
        return null;
    }

    return (
        <Flex opacity="60%" {...props}>
            <Center>
                <CiHeart size={size} />
                <Text fontSize={fontSize}>{`${reactCount}`}</Text>
            </Center>
        </Flex>
    );
};

export default ReactionCount;
