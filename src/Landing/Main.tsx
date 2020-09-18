import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";

import firebase from "../firebase.config";

import SignIn from "./SignIn";

const App = (): JSX.Element => {
    const [user, loadingUser, userError] = useAuthState(firebase.auth());

    return (
        <div className="container">
            <Router>
                <p> header </p>
                <Switch>
                    <Route exact path="/">
                        <p> echo - Fagutvalget for informatikk </p>
                    </Route>
                    <Route path="/admin">
                        <SignIn
                            user={user}
                            loadingUser={loadingUser}
                            userError={userError}
                        />
                    </Route>
                </Switch>
                <p> footer </p>
            </Router>
        </div>
    );
};

export default App;
