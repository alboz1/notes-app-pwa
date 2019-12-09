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
    const node = document.createElement('p');
    document.querySelector('.container').appendChild(node).textContent = 'No Internet';
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

firebase.auth().onAuthStateChanged(function(user) {
  //get any notes from localStorage
  if (user) {
    // User is signed in.
    const displayName = user.displayName;
    //add localStorage notes to the database
    const dbRef = createDb(user.uid);
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
          renderNewNote(change.doc.data(), change.doc.id)
        }

        if (change.type === 'removed') {
          //remove note
          deleteNote(change.doc.id);
        }
      });
    });

    form.addEventListener('submit', e => storeNote('database', e, dbRef));

    //delete note from database
    noteContainer.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON'){
        const id = e.target.getAttribute('data-id');
        dbRef.doc(id).delete();
      }
    });

    signOutBtn.textContent = 'Sign Out';
    signInBtn.textContent = `Signed In (${displayName})`;
    signInBtn.style.pointerEvents = 'none';
  } else {
    // User is signed out.
    document.querySelector('.container').innerHTML = '';
    signOutBtn.style.display = 'none';
    signInBtn.textContent = 'Sign In';
    signInBtn.style.pointerEvents = 'auto';

    if (localNotes.length) {
      localNotes.map(note => renderNewNote(note, note.id));
    }

    //add notes to localStorage when user is not logged in
    form.addEventListener('submit', e => storeNote('localStorage', e));

    //delete note from localStorage
    noteContainer.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'path' || e.target.tagName === 'svg') {
        const id = Number(e.target.getAttribute('data-id'));
        const updatedNotes = JSON.parse(localStorage.getItem('notes')).filter(note => {
          return id !== note.id
        });
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
        deleteNote(id);
      }
    });
  }
}, function(error) {
  console.log(error);
});