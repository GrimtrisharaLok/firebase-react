import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

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

        this.fieldValue = app.firestore.FieldValue;
        this.emailAuthProvider = app.auth.EmailAuthProvider;
        this.auth = app.auth();
        this.db = app.firestore();

        this.googleProvider = new app.auth.GoogleAuthProvider();
        this.twitterProvider = new app.auth.TwitterAuthProvider();
    }

    // * * * START AUTH API * * * //
    doCreateUserWithEmailAndPassword = (e, p) => 
        this.auth.createUserWithEmailAndPassword(e, p);

    doSignInWithEmailAndPassword = (e, p) => 
        this.auth.signInWithEmailAndPassword(e, p);

    doSignInWithGoogle = () => 
        this.auth.signInWithPopup(this.googleProvider);

    doSignInWithTwitter = () =>
        this.auth.signInWithPopup(this.twitterProvider);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = e => this.auth.sendPasswordResetEmail(e);

    doPasswordUpdate = p =>
        this.auth.currentUser.updatePassword(p);

    doSendEmailVerification = () =>
        this.auth.currentUser.sendEmailVerification();
    // * * * END AUTH API * * * //

    // * * * START MERGE AUTH AND DB USER API * * * //
    onAuthUserListener = (next, fallback) => 
        this.auth.onAuthStateChanged(authUser => {
            if(authUser){
                this.user(authUser.uid)
                .get()
                .then(snapshot => {
                    const dbUser = snapshot.data();

                    // default empty roles
                    if (!dbUser.roles) {
                        dbUser.roles = {};
                    }

                    //merge auth and db user
                    authUser = {
                        uid: authUser.uid,
                        email: authUser.email,
                        emailVerified: authUser.emailVerified,
                        providerData: authUser.providerData,
                        ...dbUser
                    };

                    next(authUser);
                })
            } else {
                fallback();
            }
        })
    // * * * END MERGE AUTH AND DB USER API * * * //

    // * * * START USER API * * * //
    user = uid => this.db.doc(`users/${uid}`);
    users = () => this.db.collection(`users`);
    // * * * END USER API * * * //
    // * * * START MESSAGE API * * * //
    message = uid => this.db.doc(`messages/${uid}`);
    messages = () => this.db.collection('messages');
    // * * * END MESSAGE API * * * //
}

export default Firebase;