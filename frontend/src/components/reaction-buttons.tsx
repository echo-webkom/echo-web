import type { ButtonProps } from '@chakra-ui/react';
import { useToast, ButtonGroup, Button, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import LanguageContext from 'language-context';
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
    const session = useSession();
    const toast = useToast();
    const isNorwegian = useContext(LanguageContext);

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<Reaction>();

    useEffect(() => {
        const fetchReactions = async () => {
            const result = await ReactionAPI.get(slug);

            if (isErrorMessage(result)) {
                setIsLoading(false);
                return;
            }

            setData(result);
            setIsLoading(false);
        };

        void fetchReactions();
    }, [slug]);

    const sendReaction = async (reaction: ReactionType) => {
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

    const handleClick = (reaction: ReactionType) => {
        if (session.status !== 'authenticated') {
            toast({
                title: isNorwegian ? 'Du må være logget inn for reagere' : 'You must be logged in to react',
                status: 'info',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        void sendReaction(reaction);
    };

    return (
        <ButtonGroup w={['full', null, null, 'auto']} id={slug}>
            <ReactionButton
                onClick={() => handleClick('LIKE')}
                {...reactions.like}
                count={data ? data.like : 0}
                isLoading={isLoading}
            />
            <ReactionButton
                onClick={() => handleClick('ROCKET')}
                {...reactions.rocket}
                count={data ? data.rocket : 0}
                isLoading={isLoading}
            />
            <ReactionButton
                onClick={() => handleClick('BEER')}
                {...reactions.beer}
                count={data ? data.beer : 0}
                isLoading={isLoading}
            />
            <ReactionButton
                onClick={() => handleClick('EYES')}
                {...reactions.eyes}
                count={data ? data.eyes : 0}
                isLoading={isLoading}
            />
            <ReactionButton
                onClick={() => handleClick('FIX')}
                {...reactions.fix}
                count={data ? data.fix : 0}
                isLoading={isLoading}
            />
        </ButtonGroup>
    );
};

interface ReactionButtonProps extends ButtonProps {
    emoji: string;
    count: number;
    isLoading?: boolean;
}

const ReactionButton = ({ emoji, isLoading, count, ...props }: ReactionButtonProps) => {
    return (
        <Button gap="2" w={['full', null, null, 'auto']} isLoading={isLoading} {...props}>
            <Text>{emoji}</Text>
            <Text>{count}</Text>
        </Button>
    );
};

export default ReactionButtons;
