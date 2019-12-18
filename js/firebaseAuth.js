function signIn(e) {
  e.preventDefault();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  firebase.auth().signInWithRedirect(provider).then(function(result) {
    const user = result.user;
    console.log(user);
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
    userId = user.uid;
    
    //add localStorage notes to the database
    if(localNotes.length) {
      localNotes.map(localNote => {
        const date = new firebase.firestore.Timestamp(localNote.date.seconds, localNote.date.nanoseconds);
        const note = {
          title: localNote.title,
          note: localNote.note,
          date: date
        };

        const encryptedNote = encryptData(note);
        dbRef.add(encryptedNote);
      })
    }
    localStorage.removeItem('notes');

    dbRef.orderBy('date', 'asc').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        const decryptedNote = {
          title: CryptoJS.AES.decrypt(change.doc.data().title, userId).toString(CryptoJS.enc.Utf8),
          note: CryptoJS.AES.decrypt(change.doc.data().note, userId).toString(CryptoJS.enc.Utf8)
        }

        if (change.type === 'added') {
          //add note
          renderNewNote(decryptedNote, change.doc.id);
        }

        if (change.type === 'modified') {
          renderUpdatedNote(decryptedNote.title, decryptedNote.note, change.doc.id);
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
    userId = undefined;
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