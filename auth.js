// auth.js
$(document).ready(function() {
    
const firebaseConfig = {
  apiKey: "AIzaSyBlaYF0NF-giTMZ5Q0DT3-5LnwZQD79K2s",
  authDomain: "onlinekenyandraughts.firebaseapp.com",
  projectId: "onlinekenyandraughts",
  storageBucket: "onlinekenyandraughts.firebasestorage.app",
  messagingSenderId: "193247831989",
  appId: "1:193247831989:web:1a2ebb7451c3a70a7bdbfc"
};

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    const authContainer = $('#auth-container');
    const gameWrapper = $('#game-wrapper');
    const authError = $('#auth-error');

    // --- Event Listeners ---
    $('#signup-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#signup-email').val();
        const password = $('#signup-password').val();
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('User signed up:', userCredential.user);
                authError.text('');
            })
            .catch(error => {
                authError.text(error.message);
            });
    });

    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#login-email').val();
        const password = $('#login-password').val();
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('User logged in:', userCredential.user);
                authError.text('');
            })
            .catch(error => {
                authError.text(error.message);
            });
    });

    $('#logout-btn').on('click', function() {
        auth.signOut();
    });

    // --- Auth State Observer ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            authContainer.addClass('hidden');
            gameWrapper.removeClass('hidden');
            
            // Extract username from email
            const username = user.email.split('@')[0];
            $('#username').text(username);
            
            // Initialize the game now that we are logged in
            window.initializeGame(username);

        } else {
            // User is signed out
            authContainer.removeClass('hidden');
            gameWrapper.addClass('hidden');

            // Disconnect from game server if connection exists
            if (window.gameSocket) {
                window.gameSocket.close();
            }
        }
    });
});