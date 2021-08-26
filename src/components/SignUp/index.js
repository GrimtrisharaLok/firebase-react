import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const SignUpPage = () => (
    <div>
        <h1>Sign Up</h1>
        <SignUpForm />
    </div>
);

const INITIAL_STATE = {
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    isAdmin: false,
    error: null
};

class SignUpFormBase extends Component {
    constructor(props){
        super(props);
        
        this.state = { ...INITIAL_STATE }
    }

    onSubmit = e => {
        const { username, email, passwordOne, isAdmin } = this.state;
        const roles = {};

        if(isAdmin) {
            roles[ROLES.ADMIN] = ROLES.ADMIN
        }
        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                // Create a user in Firebase realtime database
                return this.props.firebase
                        .user(authUser.user.uid)
                        .set({
                            username,
                            email,
                            roles
                        });
                    })
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
        this.setState({ [e.target.name]: e.target.value });
    }

    onChangeCheckbox = e => {
        this.setState({ [e.target.name]: e.target.checked });
    }

    render(){
        const { 
            username,
            email,
            passwordOne,
            passwordTwo,
            isAdmin,
            error
        } = this.state;

        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '' ||
            username === '';

        return (
            <form onSubmit={this.onSubmit}>
                {/* Controlled Components (State controls the value of input box, not itself) */}
                <input
                    name="username"
                    value={username}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Display Name"
                />
                <input
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="email"
                    placeholder="Email"
                />
                <input
                    name="passwordOne"
                    value={passwordOne}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Password"
                />
                <input
                    name="passwordTwo"
                    value={passwordTwo}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Confirm Password"
                />
                <label>
                    Admin: 
                    <input
                        name="isAdmin"
                        type="checkbox"
                        check={isAdmin}
                        onChange={this.onChangeCheckbox}
                    />
                </label>
                <button disabled={isInvalid} type="submit">Sign In</button>

                {error && <p>{error.message}</p>}
            </form>
        );
    }
}

const SignUpLink = () => (
    <p>
        Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
    </p>
)

const SignUpForm = compose(
    withRouter,
    withFirebase
)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink};