function signIn(e) {
  e.preventDefault();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  firebase.auth().signInWithRedirect(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    console.log(result);
    const token = result.credential.accessToken;
    console.log(token);
    // The signed-in user info.
    const user = result.user;
    console.log(user);
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
    document.querySelector('.error-pop-up').style.display = 'block';
    setTimeout(() => {
      document.querySelector('.error-pop-up').style.display = 'none';
    }, 2000);
    clearTimeout();
    // The email of the user's account used.
    const email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    const credential = error.credential;
  });
}

function signOut(e) {
  e.preventDefault();
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    console.log('User signed out');
    localNotes.splice(0, localNotes.length);
  }).catch(function(error) {
    // An error happened.
    console.log(error);
  });
}

const user = firebase.auth().currentUser;
if (user === null) {
    document.querySelector('.loading-screen').style.display = 'block';
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    const profilePicture = user.photoURL;
    const dbRef = createDb(user.uid);
    
    database = dbRef;
    storageRef = 'database';

    //add localStorage notes to the database
    if(localNotes.length) {
      localNotes.map(localNote => {
        const note = {
          title: localNote.title,
          note: localNote.note
        };
        dbRef.add(note);
      })
    }

    localStorage.removeItem('notes');
    
    dbRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          //add note
          renderNewNote(change.doc.data(), change.doc.id);
        }

        if (change.type === 'modified') {
          renderUpdatedNote(change.doc.data().title, change.doc.data().note, change.doc.id);
        }

        if (change.type === 'removed') {
          //remove note
          deleteNote(change.doc.id);
        }
      });
    });

    document.querySelector('.loading-screen').style.display = 'none';
    signOutBtn.textContent = 'Sign Out';
    imgEl.style.display = 'inline';
    imgEl.src = profilePicture;
    signInBtn.textContent = '';
    signInBtn.style.textDecoration = 'none';
  } else {
    // User is signed out.
    document.querySelector('.loading-screen').style.display = 'none';
    document.querySelector('.container').innerHTML = '';
    signOutBtn.style.display = 'none';
    signInBtn.textContent = 'Sign In with Google';
    signInBtn.style.textDecoration = 'underline';
    imgEl.style.display = 'none';
    
    if (localNotes.length) {
      localNotes.map(note => renderNewNote(note, note.id));
    }

    storageRef = 'localStorage';
  }
}, function(error) {
  console.log(error);
});