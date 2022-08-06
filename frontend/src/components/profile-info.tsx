import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
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
    const { handleSubmit } = methods;
    const [profileState, setProfileState] = useState<ProfileState>({ infoState: InfoState.IDLE, errorMessage: null });

    const submitForm: SubmitHandler<ProfileFormValues> = async (data: ProfileFormValues) => {
        setProfileState({ infoState: InfoState.SAVING, errorMessage: null });
        const res = await UserAPI.putUser({
            email: user.email,
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
                Email
            </Heading>
            <Text data-cy="profile-email" mb="1rem">
                {user.email}
            </Text>
            <FormProvider {...methods}>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form data-cy="profile-form" id="profile-form" onSubmit={handleSubmit(submitForm)}>
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
