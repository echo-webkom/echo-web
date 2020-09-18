import React, { useState } from "react";
import firebase from "../firebase.config";

interface Props {
    user: firebase.User | undefined;
    loadingUser: boolean;
    userError: firebase.auth.Error | undefined;
}

const SignIn = ({ user, loadingUser, userError }: Props): JSX.Element => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = (evt: React.FormEvent): void => {
        evt.preventDefault();
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then()
            .catch((err) => {
                console.log(err.code);
                console.log(err.message);
            });
    };

    const logout = (): void => {
        firebase.auth().signOut();
    };

    return (
        <>
            {userError && !user && <p>Faen noe gikk galt shit ass</p>}
            {loadingUser && !user && <p>laster inn...</p>}
            {user && !userError && (
                <div>
                    <p>Logget på som: {user.email}</p>
                    <button type="button" onClick={logout}>
                        Logg ut
                    </button>
                </div>
            )}
            {!user && (
                <form onSubmit={(evt) => login(evt)}>
                    <input
                        type="email"
                        autoComplete="email"
                        placeholder="email"
                        value={email}
                        onChange={(evt) => setEmail(evt.target.value)}
                    />
                    <input
                        type="password"
                        autoComplete="password"
                        placeholder="passord"
                        value={password}
                        onChange={(evt) => setPassword(evt.target.value)}
                    />
                    <input type="submit" value="Logg inn" />
                </form>
            )}
        </>
    );
};

export default SignIn;
