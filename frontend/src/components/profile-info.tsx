import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Box, Heading, Text, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { ProfileFormValues, UserWithName, UserAPI } from '../lib/api';
import FormDegree from './form-degree';
import FormDegreeYear from './form-degree-year';

enum InfoState {
    IDLE,
    EDITED,
    SAVING,
    SAVED,
    ERROR,
}

interface ProfileState {
    infoState: InfoState;
    errorMessage: string | null;
}

const ProfileInfo = ({ user }: { user: UserWithName }): JSX.Element => {
    const methods = useForm<ProfileFormValues>();
    const { handleSubmit, register } = methods;
    const [profileState, setProfileState] = useState<ProfileState>({ infoState: InfoState.IDLE, errorMessage: null });

    const submitForm: SubmitHandler<ProfileFormValues> = async (data: ProfileFormValues) => {
        setProfileState({ infoState: InfoState.SAVING, errorMessage: null });
        const res = await UserAPI.putUser({
            email: user.email,
            alternateEmail: data.alternateEmail,
            degree: data.degree,
            degreeYear: +data.degreeYear,
        });

        if (typeof res !== 'string') {
            setProfileState({ infoState: InfoState.ERROR, errorMessage: res.message });
        } else {
            setProfileState({ infoState: InfoState.SAVED, errorMessage: null });
        }
    };

    return (
        <Box>
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
                            type="email"
                            placeholder="E-post"
                            onInput={() => setProfileState({ infoState: InfoState.EDITED, errorMessage: null })}
                            defaultValue={user.alternateEmail ?? undefined}
                            mb="1rem"
                            {...register('alternateEmail')}
                        />
                    </FormControl>
                    <FormDegree
                        isHeading
                        data-cy="profile-degree"
                        onInput={() => setProfileState({ infoState: InfoState.EDITED, errorMessage: null })}
                        defaultValue={user.degree ?? undefined}
                        py="1rem"
                    />
                    <FormDegreeYear
                        isHeading
                        data-cy="profile-degree-year"
                        onInput={() => setProfileState({ infoState: InfoState.EDITED, errorMessage: null })}
                        defaultValue={user.degreeYear ?? undefined}
                        py="1rem"
                    />
                    <Button
                        disabled={profileState.infoState !== InfoState.EDITED}
                        isLoading={profileState.infoState === InfoState.SAVING}
                        type="submit"
                        form="profile-form"
                        mr={3}
                        colorScheme="teal"
                    >
                        {profileState.infoState === InfoState.SAVED ? 'Endringer lagret!' : 'Lagre endringer'}
                    </Button>
                    {profileState.errorMessage && (
                        <Text color="red">Det har skjedd en feil. Prøv å logg inn og ut, og prøv igjen.</Text>
                    )}
                </form>
            </FormProvider>
        </Box>
    );
};

export default ProfileInfo;
