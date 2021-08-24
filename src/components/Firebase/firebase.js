import app from 'firebase/app';
import 'firebase/auth';

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

class Firebase {
    constructor(){
        app.initializeApp(config);

        this.auth = app.auth();
    }

    // * * * START AUTH API * * *
    doCreateUserWithEmailAndPassword = (e, p) => 
        this.auth.createUserWithEmailAndPassword(e, p);

    doSignInWithEmailAndPassword = (e, p) => 
        this.auth.signInWithEmailAndPassword(e, p);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = e => this.auth.sendPasswordResetEmail(e);

    doPasswordUpdate = p =>
        this.auth.currentUser.updatePassword(p);
    // * * * END AUTH API * * *
}

export default Firebase;