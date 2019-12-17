//register service worker
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('service worker registered'))
        .catch(err => console.log('service worker not registered', err));
    });
}

const signInBtn = document.querySelector('#sign-in');
const signOutBtn = document.querySelector('#sign-out');
const imgEl = document.querySelector('#profile-picture');
const form = document.querySelector('.new-note-form');
const addNewNoteBtn = document.querySelector('#open-sidebar');
const noteContainer = document.querySelector('.container');

function renderNewNote(noteInfo, id) {
    const newNote = document.createElement('div');
    newNote.classList.add('note-container');
    newNote.setAttribute('data-id', id);
    const firstChild = noteContainer.firstChild;

    const note = `
        <header class="note-header">
            <h4 class="note-title">${noteInfo.title}</h4>
            <button class="delete-btn" data-id="${id}"><svg version="1.1" data-id="${id}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            width="16px" height="16px" viewBox="0 0 459 459" style="enable-background:new 0 0 459 459;" xml:space="preserve"><g><g id="delete">
                <path data-id="${id}" d="M76.5,408c0,28.05,22.95,51,51,51h204c28.05,0,51-22.95,51-51V102h-306V408z M408,25.5h-89.25L293.25,0h-127.5l-25.5,25.5
                    H51v51h357V25.5z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg></button>
        </header>
        <p class="note-content">${noteInfo.note}</p>
    `
    newNote.innerHTML = note;

    noteContainer.insertBefore(newNote, firstChild);
}

//get localNotes
let localNotes = JSON.parse(localStorage.getItem('notes')) || [];
//generate simple id for notes that are stored in local storage
let id = localNotes.length === 0 ? 0 : localNotes[localNotes.length - 1].id;

let storageRef = '';
let database = undefined;
let userId = undefined;

function storeNote(e) {
    e.preventDefault();
    const date = new Date();
    if (storageRef === 'localStorage') {
        id++;
        const note = {
            title: form.title.value,
            note: form.note.value,
            date: date,
            id: id
        }
        localNotes.push(note);
        localStorage.setItem('notes', JSON.stringify(localNotes));
        renderNewNote(note, id);
    }
    if (storageRef === 'database') {
        const note = {
            title: form.title.value,
            note: form.note.value,
            date: date
        };
        const encryptedNote = encryptData(note);
        database.add(encryptedNote);
    }
    form.reset();
}

// encrypt note data before storing them to the database
function encryptData(note) {
    return {
        title: CryptoJS.AES.encrypt(note.title, userId).toString(),
        note: CryptoJS.AES.encrypt(note.note, userId).toString(),
        date: note.date
    }
}

function deleteNote(id) {
    const note = document.querySelector(`.note-container[data-id="${id}"]`);
    note.remove();
};

//switch app theme
const switchToggle = document.querySelector('#theme-switch');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }    
}

//save theme option to the localStorage
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        switchToggle.checked = true;
    }
}

function saveNote(title, note, id) {
    if (storageRef === 'localStorage') {
        localNotes.map(localNote => {
            if (Number(id) === localNote.id) {
                localNote.title = title;
                localNote.note = note;

                renderUpdatedNote(title, note, id);
            }
        });
        localStorage.setItem('notes', JSON.stringify(localNotes));
    }

    if (storageRef === 'database') {
        database.doc(id).update({
            title: CryptoJS.AES.encrypt(title, userId).toString(),
            note: CryptoJS.AES.encrypt(note, userId).toString()
        });
    }
}

function renderUpdatedNote(title, note, id) {
    const titleEl = document.querySelector(`.note-container[data-id="${id}"] .note-title`);
    const noteEl = document.querySelector(`.note-container[data-id="${id}"] .note-content`);

    titleEl.textContent = title;
    noteEl.textContent = note;
}

function closeEditor() {
    editor.classList.remove('open-edit-note');
}

const sidebarMask = document.querySelector('.sidebar-mask');
const sidebar = document.querySelector('.sidebar');
const editor = document.querySelector('.edit-note-container');
let idRef = undefined;

document.addEventListener('DOMContentLoaded', () => {
    signInBtn.addEventListener('click', signIn);
    signOutBtn.addEventListener('click', signOut);

    addNewNoteBtn.addEventListener('click', () => {
        editor.classList.remove('open-edit-note');
        form.title.select();
        sidebar.classList.toggle('open');
        addNewNoteBtn.classList.toggle('rotate');
        if (!sidebarMask.classList.contains('sidebar-mask-open') || !addNewNoteBtn.classList.contains('rotate')) {
            sidebarMask.classList.toggle('sidebar-mask-open');
        }
    });

    sidebarMask.addEventListener('click', function() {
        this.classList.remove('sidebar-mask-open');
        sidebar.classList.remove('open');
        addNewNoteBtn.classList.remove('rotate');
        if (editor.classList.contains('open-edit-note')) {
            saveNote(document.querySelector('#edit-title').value, document.querySelector('#edit-note').value, idRef);
        }
        document.body.style.overflowY = 'auto';
        editor.style.animation = '0.25s 1 normal cubic-bezier(0,0,.05,.93) slideout';
        editor.addEventListener('animationend', closeEditor);
    });

    switchToggle.addEventListener('change', switchTheme);
    form.addEventListener('submit', e => storeNote(e));

    //save the edited note
    const closeEditorBtn = document.querySelector('.close-editor');
    closeEditorBtn.addEventListener('click', () => {
        document.body.style.overflowY = 'auto';
        editor.style.animation = '0.25s 1 normal cubic-bezier(0,0,.05,.93) slideout';
        editor.addEventListener('animationend', closeEditor);
        sidebarMask.classList.remove('sidebar-mask-open');
        saveNote(document.querySelector('#edit-title').value, document.querySelector('#edit-note').value, idRef);
        document.querySelector('#edit-title').value = '';
        document.querySelector('#edit-note').textContent = '';
    });


    noteContainer.addEventListener('click', e => {
        //delete note from localStorage or firestore database
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'path' || e.target.tagName === 'svg') {
            const id = e.target.getAttribute('data-id');

            if (storageRef === 'localStorage') {
                localNotes = localNotes.filter(note => Number(id) !== note.id);
                localStorage.setItem('notes', JSON.stringify(localNotes));
                deleteNote(id);
            }

            if (storageRef === 'database') {
                database.doc(id).delete();
            }
        }
        //open editor for the note user clicked
        if (e.target.className === 'note-container' || e.target.tagName === 'HEADER' || e.target.tagName === 'H4' || e.target.tagName === 'P') {
            document.body.style.overflowY = 'hidden';
            editor.removeEventListener('animationend', closeEditor);
            editor.style.animation = '0.25s 1 normal cubic-bezier(0,0,.05,.93) slidein';
            editor.classList.add('open-edit-note');
            sidebarMask.classList.add('sidebar-mask-open');
            const id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id') || e.target.parentNode.parentNode.getAttribute('data-id');
            idRef = id;
            
            const titleEl = document.querySelector(`.note-container[data-id="${id}"] .note-title`);
            const noteEl = document.querySelector(`.note-container[data-id="${id}"] .note-content`);
            document.querySelector('#edit-title').value = titleEl.textContent;
            document.querySelector('#edit-note').value = noteEl.textContent;
        }
    });
});