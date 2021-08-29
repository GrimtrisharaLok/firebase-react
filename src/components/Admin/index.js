import React, { Component } from 'react';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization, withEmailVerification } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';
import { Switch, Route, Link } from 'react-router-dom';

const AdminPage = () => (
    <div>
        <h1>Admin</h1>
        <p>The admin page is accessible by every signed in admin user.</p>

        <Switch>
            <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
            <Route exact path={ROUTES.ADMIN} component={UserList} />
        </Switch>
    </div>
);

class UserItemBase extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            user: null,
            ...props.location.state
        }
    }

    onSendPasswordResetEmail = () => {
        this.props.firebase.doPasswordReset(this.state.user.email);
    }

    componentDidMount() {
        if (this.state.user) {
            return;
        }
        this.setState({ loading: true });

        this.unsubscribe = this.props.firebase
            .user(this.props.match.params.id)
            .onSnapshot(snapshot => {
                this.setState({
                    user: snapshot.data(),
                    loading: false
                });
            });
    }

    componentWillUnmount() {
        this.unsubscribe && this.unsubscribe();
    }

    render() {
        const { user, loading } = this.state;

        return (
            <div>
                <h2>User ({this.props.match.params.id})</h2>
                {loading && <div>Loading ...</div>}

                {user && (
                    <div>
                        <span>
                            <strong>ID:</strong> {user.uid}
                        </span>
                        <span>
                            <strong>E-Mail:</strong> {user.email}
                        </span>
                        <span>
                            <strong>Username</strong> {user.username}
                        </span>
                        <span>
                            <button
                                type="button"
                                onClick={this.onSendPasswordResetEmail}
                            >
                                Send Password Reset
                            </button>
                        </span>
                    </div>
                )}
            </div>
        )
    }
}

class UserListBase extends Component {
    constructor(props){
        super(props);

        this.state = {
            loading: false,
            users: []
        }
    }

    componentDidMount() {
        this.setState({ loading: true });

        this.unsubscribe =  this.props.firebase.users().onSnapshot(snapshot => {
            let users = [];

            snapshot.forEach(doc => {
                users.push({ ...doc.data(), uid: doc.id });
            })

            this.setState({
                users,
                loading: false
            })
        })
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { users, loading } = this.state;

        return (
            <div>
                <h2>Users</h2>
                {loading && <div>Loading ...</div>}

                <ul>
                    {users.map(user => (
                        <li key={user.uid}>
                            <span>
                                <strong>ID:</strong> {user.uid}
                            </span>
                            | 
                            <span>
                                <strong>E-mail:</strong> {user.email}
                            </span>
                            | 
                            <span>
                                <strong>Username:</strong> {user.username}
                            </span>
                            |
                            <span>
                                <Link to={{
                                    pathname: `${ROUTES.ADMIN}/${user.uid}`,
                                    state: { user }
                                }}>
                                    Details
                                </Link>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}
/*class AdminPage extends Component {
    constructor(props){
        super(props);

        this.state = {
            loading: false,
            users: []
        };
    }

    componentDidMount(){
        this.setState({ loading: true });

        this.props.firebase.users().on('value', snapshot => {
            const userObject = snapshot.val();

            const userList = Object.keys(userObject).map(key => ({
                ...userObject[key],
                uid: key
            }));
            this.setState({
                users: userList,
                loading: false
            });
        });
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
    }

    render() {
        const { users, loading } = this.state;

        return (
            <div>
                <h1>Admin</h1>
                <p>The Admin Page is accessible by every signed in admin user.</p>

                {loading && <div>Loading ...</div>}

                <UserList users={users} />
            </div>
        )
    }
}*/

// const UserList = ({ users }) => (
    
// )

const condition = authUser => 
    authUser && !!authUser.roles[ROLES.ADMIN];

const UserList = withFirebase(UserListBase);

const UserItem = withFirebase(UserItemBase);

export default compose(
    withEmailVerification,
    withAuthorization(condition),
    withFirebase
)(AdminPage);