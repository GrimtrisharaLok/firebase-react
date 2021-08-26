import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const SignInPage = () => (
    <div>
        <h1>Sign In</h1>
        <SignInForm />
        <SignInSocial />
        <PasswordForgetLink />
        <SignUpLink />
    </div>
);

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null
}

class SignInFormBase extends Component {
    constructor(props){
        super(props);

        this.state = { ...INITIAL_STATE }
    }

    onSubmit = e => {
        const { email, password} = this.state;

        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                this.setState({ error });
            });

        e.preventDefault();
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value})
    }

    render() {
        const { email, password, error } = this.state;

        const isInvalid = password === '' || email === '';

        return (
            <form onSubmit={this.onSubmit}>
                <input
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="email"
                    placeholder="Email"
                />
                <input
                    name="password"
                    value={password}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Password"
                />
                <button disabled={isInvalid} type="submit">Sign In</button>

                {error && <p>{error.message}</p>}
            </form>
        )
    }
}

class SignInSocialBase extends Component {
    constructor(props){
        super(props);

        this.state = { error: null };
    }

    onSubmit = e => {
        e.preventDefault();
    }

    onClick = e => {
        console.log(e.target.name);
        if (e.target.name == 'google') {
            this.props.firebase
                .doSignInWithGoogle()
                .then(socialAuthUser => {
                    return this.props.firebase
                        .user(socialAuthUser.user.uid)
                        .set({
                            username: socialAuthUser.user.displayName,
                            email: socialAuthUser.user.email,
                            roles: {}
                        });
                })
                .then(() => {
                    this.setState({ error: null });
                    this.props.history.push(ROUTES.HOME);
                })
                .catch(error => {
                    this.setState({ error });
                });
        } else if (e.target.name == 'twitter') {
            this.props.firebase
                .doSignInWithTwitter()
                .then(socialAuthUser => {
                    return this.props.firebase
                        .user(socialAuthUser.user.uid)
                        .set({
                            username: socialAuthUser.additionalUserInfo.username,
                            email: socialAuthUser.user.email,
                            roles: {}
                        });
                })
                .then(() => {
                    this.setState({ error: null });
                    this.props.history.push(ROUTES.HOME);
                })
                .catch(error => {
                    this.setState({ error });
                });
        }
    }

    render() {
        const { error } = this.state;

        return (
            <form onSubmit={this.onSubmit}>
                <button name="google" onClick={this.onClick} type="button">Sign In with Google</button>
                <button name="twitter" onClick={this.onClick} type="button">Sign In with Twitter</button>

                {error && <p>{error.message}</p>}
            </form>
        )
    }
}

const SignInForm = compose(
    withRouter,
    withFirebase
)(SignInFormBase);

const SignInSocial = compose(
    withRouter,
    withFirebase
)(SignInSocialBase);

export default SignInPage;

export { SignInForm, SignInSocial };