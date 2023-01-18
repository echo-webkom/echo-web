import type { ButtonGroupProps, ButtonProps } from '@chakra-ui/react';
import { useToast, ButtonGroup, Button, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { Reaction, ReactionType } from '@api/reaction';
import ReactionAPI from '@api/reaction';
import { isErrorMessage } from '@utils/error';
import useAuth from '@hooks/use-auth';

const reactions = {
    like: {
        title: 'Tommel opp',
        emoji: '👍',
    },
    rocket: {
        title: 'To the moon!',
        emoji: '🚀',
    },
    beer: {
        title: 'Eyy!',
        emoji: '🍻',
    },
    eyes: {
        title: 'Spennende',
        emoji: '👀',
    },
    fix: {
        title: 'Fix!',
        emoji: '🔧',
    },
};

interface Props extends ButtonGroupProps {
    slug: string;
}

const ReactionButtons = ({ slug, ...props }: Props) => {
    const toast = useToast();
    const { signedIn, idToken } = useAuth();

    const [data, setData] = useState<Reaction | null>(null);

    useEffect(() => {
        const fetchReactions = async () => {
            if (!signedIn || !idToken) return;

            const result = await ReactionAPI.get(slug, idToken);

            if (isErrorMessage(result)) {
                return;
            }

            setData(result);
        };

        void fetchReactions();
    }, [signedIn, idToken, slug]);

    const handleClick = async (reaction: ReactionType) => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Du er ikke logget inn.',
                description: 'Du må være logget inn for å reagere.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const result = await ReactionAPI.put(slug, reaction, idToken);

        if (isErrorMessage(result)) {
            toast({
                title: 'Noe gikk galt',
                description: result.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setData(result);
    };

    if (data === null) {
        return null;
    }

    return (
        <ButtonGroup w={['full', null, null, 'auto']} {...props}>
            <ReactionButton
                onClick={() => void handleClick('LIKE')}
                {...reactions.like}
                count={data.like}
                clicked={data.reactedTo.includes('LIKE')}
            />
            <ReactionButton
                onClick={() => void handleClick('ROCKET')}
                {...reactions.rocket}
                count={data.rocket}
                clicked={data.reactedTo.includes('ROCKET')}
            />
            <ReactionButton
                onClick={() => void handleClick('BEER')}
                {...reactions.beer}
                count={data.beer}
                clicked={data.reactedTo.includes('BEER')}
            />
            <ReactionButton
                onClick={() => void handleClick('EYES')}
                {...reactions.eyes}
                count={data.eyes}
                clicked={data.reactedTo.includes('EYES')}
            />
            <ReactionButton
                onClick={() => void handleClick('FIX')}
                {...reactions.fix}
                count={data.fix}
                clicked={data.reactedTo.includes('FIX')}
            />
        </ButtonGroup>
    );
};

interface ReactionButtonProps extends ButtonProps {
    emoji: string;
    count: number;
    clicked: boolean;
}

const ReactionButton = ({ emoji, count, clicked, ...props }: ReactionButtonProps) => {
    return (
        <Button
            rounded="3xl"
            size="sm"
            gap="2"
            w={['full', null, null, 'auto']}
            _light={{
                bg: clicked ? 'cyan.100' : 'gray.50',
                _hover: { bg: clicked ? 'cyan.200' : 'gray.100' },
            }}
            _dark={{ bg: clicked ? 'cyan.600' : 'gray.800', _hover: { bg: clicked ? 'cyan.700' : 'gray.700' } }}
            {...props}
        >
            <Text>{emoji}</Text>
            <Text>{count}</Text>
        </Button>
    );
};

export default ReactionButtons;
