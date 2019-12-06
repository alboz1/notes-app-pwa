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
  }).catch(function(error) {
    // An error happened.
    console.log(error);
  });
}


const localNotes = JSON.parse(localStorage.getItem('notes')) || [];
firebase.auth().onAuthStateChanged(function(user) {
  //get any notes from localStorage
  if (user) {
    // User is signed in.
    const displayName = user.displayName;
    const email = user.email;
    const emailVerified = user.emailVerified;
    const dbRef = db.collection('users').doc(user.uid).collection('notes');
    //add localStorage notes to the database
    dbRef.add(localNotes);

    dbRef.onSnapshot(snapshot => {
        console.log(snapshot);
        snapshot.docChanges().forEach(change => {
            console.log(change.doc.data());

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

    form.addEventListener('submit', e => {
        e.preventDefault();
    
        const note = {
            title: form.title.value,
            note: form.note.value
        };
    
        dbRef.add(note);
    
        form.reset();
    });

    //delete note from database
    noteContainer.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON'){
        const id = e.target.getAttribute('data-id');
        dbRef.doc(id).delete();
      }
    });
    console.log(displayName, email, emailVerified);
    console.log(user.uid);
    signOutBtn.textContent = 'Sign Out';
    signInBtn.textContent = `Signed In (${displayName})`;
    signInBtn.style.pointerEvents = 'none';
    // user.getIdToken().then(function(accessToken) {
    // });
  } else {
    // User is signed out.
    document.querySelector('.container').innerHTML = '';
    signOutBtn.style.display = 'none';
    signInBtn.textContent = 'Sign In';
    signInBtn.style.pointerEvents = 'auto';
    console.log('not logged in');
    localNotes.map(note => renderNewNote(note));

    //add notes to localStorage when user is not logged in
    form.addEventListener('submit', e => {
        e.preventDefault();
        const notes = [];
        const note = {
            title: form.title.value,
            note: form.note.value,
        }
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNewNote(note);
    });
    //delete note from localStorage
    noteContainer.addEventListener('click', function(e) {
      const noteTitle = this.querySelector('.note-title');
      const parent = noteTitle.parentNode;
      if (e.target.tagName === 'BUTTON') {
        const updatedNotes = JSON.parse(localStorage.getItem('notes')).filter(note => {
          return note.title !== noteTitle.textContent
        });
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
        parent.remove();
      }
    });
  }
}, function(error) {
  console.log(error);
});