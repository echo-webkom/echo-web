import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
    Input,
    Center,
    VStack,
    Heading,
    Text,
} from '@chakra-ui/react';
import { UserAPI } from '@api/user';
import useAuth from '@hooks/use-auth';
import Section from '@components/section';

interface FormValues {
    email: string;
    days: number;
}

const WhitelistPage = () => {
    const { register, handleSubmit } = useForm<FormValues>();
    const { user, idToken } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.memberships.includes('webkom')) {
            setError('Du har ikke tilgang til denne siden.');
            return;
        }

        setError(null);
    }, [user]);

    const onSubmit = async (data: FormValues) => {
        setError(null);

        if (!idToken) {
            setError('Du må være logget inn for å gjøre dette.');
            return;
        }

        const response = await UserAPI.putWhitelist({ idToken, email: data.email, days: data.days });

        if (response === false) {
            setError('Du har ikke tilgang til å gjøre dette.');
            return;
        }

        if (response === null) {
            setError(`Det har skjedd en feil.`);
            return;
        }
    };

    return (
        <Section>
            <Center>
                {error && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>En feil har skjedd.</Heading>
                        <Text>{error}</Text>
                    </Center>
                )}
                {!error && (
                    <>
                        {/* eslint-disable @typescript-eslint/no-misused-promises */}
                        <form onSubmit={handleSubmit(onSubmit)} id="whitelist-form">
                            {/* eslint-enable @typescript-eslint/no-misused-promises */}
                            <VStack>
                                <Heading size="xl" mb="1rem">
                                    Legg til på whitelist
                                </Heading>
                                <FormControl>
                                    <FormLabel>
                                        <Heading size="sm">Studentmail</Heading>
                                    </FormLabel>
                                    <Input type="email" {...register('email')} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>
                                        <Heading size="sm">Dager</Heading>
                                    </FormLabel>
                                    <NumberInput defaultValue={30}>
                                        <NumberInputField {...register('days', { valueAsNumber: true })} />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </FormControl>
                                <Button type="submit" form="whitelist-form" p="1rem">
                                    Legg til
                                </Button>
                            </VStack>
                        </form>
                    </>
                )}
            </Center>
        </Section>
    );
};

export default WhitelistPage;
