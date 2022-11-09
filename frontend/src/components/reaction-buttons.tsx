import type { ButtonProps } from '@chakra-ui/react';
import { useToast, ButtonGroup, Button, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import type { Reaction, ReactionType } from '@api/reaction';
import ReactionAPI from '@api/reaction';
import { isErrorMessage } from '@utils/error';

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

interface Props {
    slug: string;
}

const ReactionButtons = ({ slug }: Props) => {
    const toast = useToast();

    const [data, setData] = useState<Reaction | null>(null);

    useEffect(() => {
        const fetchReactions = async () => {
            const result = await ReactionAPI.get(slug);

            if (isErrorMessage(result)) {
                return;
            }

            setData(result);
        };

        void fetchReactions();
    }, [slug]);

    const handleClick = async (reaction: ReactionType) => {
        const result = await ReactionAPI.post(slug, reaction);

        if (isErrorMessage(result)) {
            toast({
                title: 'Noe gikk galt',
                description: result.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        } else {
            setData(result);
            toast({
                title: 'Reaksjon sendt!',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (data === null) {
        return null;
    }

    return (
        <ButtonGroup w={['full', null, null, 'auto']} id={slug}>
            <ReactionButton onClick={() => void handleClick('LIKE')} {...reactions.like} count={data.like} />
            <ReactionButton onClick={() => void handleClick('ROCKET')} {...reactions.rocket} count={data.rocket} />
            <ReactionButton onClick={() => void handleClick('BEER')} {...reactions.beer} count={data.beer} />
            <ReactionButton onClick={() => void handleClick('EYES')} {...reactions.eyes} count={data.eyes} />
            <ReactionButton onClick={() => void handleClick('FIX')} {...reactions.fix} count={data.fix} />
        </ButtonGroup>
    );
};

interface ReactionButtonProps extends ButtonProps {
    emoji: string;
    count: number;
}

const ReactionButton = ({ emoji, count, ...props }: ReactionButtonProps) => {
    return (
        <Button
            rounded="3xl"
            size="sm"
            _light={{ bg: 'gray.50', _hover: { bg: 'gray.100' } }}
            _dark={{ bg: 'gray.800', _hover: { bg: 'gray.700' } }}
            gap="2"
            w={['full', null, null, 'auto']}
            {...props}
        >
            <Text>{emoji}</Text>
            <Text>{count}</Text>
        </Button>
    );
};

export default ReactionButtons;
