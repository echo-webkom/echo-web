import { signOut } from 'next-auth/react';
import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Box, Heading, Text, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { isErrorMessage, ProfileFormValues, UserWithName, UserAPI } from '../lib/api';
import FormDegree from './form-degree';
import FormDegreeYear from './form-degree-year';

interface ProfileState {
    infoState: 'idle' | 'edited' | 'saving' | 'saved' | 'error';
    errorMessage: string | null;
}

const ProfileInfo = ({ user }: { user: UserWithName }): JSX.Element => {
    const methods = useForm<ProfileFormValues>();
    const { handleSubmit, register } = methods;
    const [profileState, setProfileState] = useState<ProfileState>({ infoState: 'idle', errorMessage: null });

    const submitForm: SubmitHandler<ProfileFormValues> = async (data: ProfileFormValues) => {
        setProfileState({ infoState: 'saving', errorMessage: null });
        const res = await UserAPI.putUser({
            email: user.email,
            alternateEmail: data.alternateEmail,
            degree: data.degree,
            degreeYear: +data.degreeYear,
        });

        if (isErrorMessage(res)) {
            setProfileState({ infoState: 'error', errorMessage: res.message });
            return;
        }

        if (res.status === 200) {
            setProfileState({ infoState: 'saved', errorMessage: null });
        } else {
            setProfileState({ infoState: 'error', errorMessage: res.response });
        }
    };

    return (
        <Box maxW="xl">
            <Heading size="md" my="0.5rem">
                Navn
            </Heading>
            <Text data-cy="profile-name">{user.name}</Text>
            <Heading size="md" my="0.5rem">
                E-post
            </Heading>
            <Text data-cy="profile-email" my="0.5rem">
                {user.email}
            </Text>
            <FormProvider {...methods}>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form data-cy="profile-form" id="profile-form" onSubmit={handleSubmit(submitForm)}>
                    <FormControl>
                        <FormLabel>
                            <Heading size="md" display="inline">
                                Alternativ e-post
                            </Heading>
                            <Text>Denne vil bli brukt i stedet for studentmailen din.</Text>
                        </FormLabel>
                        <Input
                            data-cy="profile-alt-email"
                            type="email"
                            placeholder="E-post"
                            onInput={() => setProfileState({ infoState: 'edited', errorMessage: null })}
                            defaultValue={user.alternateEmail ?? undefined}
                            mb="1rem"
                            {...register('alternateEmail')}
                        />
                    </FormControl>
                    <FormDegree
                        isHeading
                        data-cy="profile-degree"
                        onInput={() => setProfileState({ infoState: 'edited', errorMessage: null })}
                        defaultValue={user.degree ?? undefined}
                        py="1rem"
                    />
                    <FormDegreeYear
                        isHeading
                        data-cy="profile-degree-year"
                        onInput={() => setProfileState({ infoState: 'edited', errorMessage: null })}
                        defaultValue={user.degreeYear ?? undefined}
                        py="1rem"
                    />
                    <Button
                        disabled={profileState.infoState !== 'edited'}
                        isLoading={profileState.infoState === 'saving'}
                        type="submit"
                        form="profile-form"
                        mr={3}
                        colorScheme="teal"
                    >
                        {profileState.infoState === 'saved' ? 'Endringer lagret!' : 'Lagre endringer'}
                    </Button>
                    <Button onClick={() => void signOut()} colorScheme="red">
                        Logg ut
                    </Button>
                    {profileState.errorMessage && (
                        <Text fontWeight="bold" color="red" pt="3">
                            {profileState.errorMessage}
                        </Text>
                    )}
                </form>
            </FormProvider>
        </Box>
    );
};

export default ProfileInfo;
