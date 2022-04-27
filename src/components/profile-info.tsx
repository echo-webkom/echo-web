import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Box, Heading, Text, FormControl, Button, Select } from '@chakra-ui/react';
import { ProfileFormValues, UserWithName, UserAPI, Degree } from '../lib/api';

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
    const { register, handleSubmit } = methods;
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
            <Text>{user.name}</Text>
            <Heading size="md" my="0.5rem">
                Email
            </Heading>
            <Text>{user.email}</Text>
            <FormProvider {...methods}>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form data-cy="profile-form" id="profile-form" onSubmit={handleSubmit(submitForm)}>
                    <FormControl id="degree" isRequired>
                        <Heading size="md" mt="0.5rem">
                            Studieretning
                        </Heading>
                        <Select
                            onInput={() => setProfileState({ infoState: InfoState.EDITED, errorMessage: null })}
                            defaultValue={user.degree ?? undefined}
                            placeholder="Velg studieretning"
                            isRequired
                            py="1rem"
                            {...register('degree')}
                        >
                            <option value={Degree.DTEK}>Datateknologi</option>
                            <option value={Degree.DSIK}>Datasikkerhet</option>
                            <option value={Degree.DVIT}>Data Science/Datavitenskap</option>
                            <option value={Degree.BINF}>Bioinformatikk</option>
                            <option value={Degree.IMO}>Informatikk-matematikk-økonomi</option>
                            <option value={Degree.INF}>Master i informatikk</option>
                            <option value={Degree.PROG}>Felles master i programvareutvikling</option>
                            <option value={Degree.ARMNINF}>Årsstudium i informatikk</option>
                            <option value={Degree.POST}>Postbachelor</option>
                            <option value={Degree.MISC}>Annet studieløp</option>
                        </Select>
                    </FormControl>
                    <FormControl as="fieldset" isRequired>
                        <Heading size="md">Årstrinn</Heading>
                        <Select
                            onInput={() => setProfileState({ infoState: InfoState.EDITED, errorMessage: null })}
                            defaultValue={user.degreeYear ?? undefined}
                            placeholder="Velg årstrinn"
                            isRequired
                            py="1rem"
                            {...register('degreeYear')}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </Select>
                    </FormControl>
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
