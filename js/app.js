//register service worker
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('service worker registered'))
        .catch(err => console.log('service worker not registered', err));
    });
}

//get localNotes
const localNotes = JSON.parse(localStorage.getItem('notes')) || [];

const signInBtn = document.querySelector('#sign-in');
const signOutBtn = document.querySelector('#sign-out');
const form = document.querySelector('.new-note-form');
const addNewNoteBtn = document.querySelector('#open-sidebar');
const noteContainer = document.querySelector('.container');

function renderNewNote(noteInfo, id) {
    const note = `
        <div class="note-container" data-id="${id}">
            <h4 class="note-title">${noteInfo.title}</h4>
            <p class="note-content">${noteInfo.note}</p>
            <button class="delete-btn" data-id="${id}">&#10006;</button>
        </div>
    `
    
    noteContainer.innerHTML += note;
}

const notes = [];
let id = localNotes.length === 0 ? 0 : localNotes[localNotes.length - 1].id;
function storeNote(storage, e, db) {
    e.preventDefault();
    
    if (storage === 'localStorage') {
        id++;
        const note = {
            title: form.title.value,
            note: form.note.value,
            id: id
        }
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNewNote(note, id);
        console.log(id);
    }
    if (storage === 'database') {
        const note = {
            title: form.title.value,
            note: form.note.value
        };
        db.add(note);
    }
    form.reset();
}

function deleteNote(id) {
    const note = document.querySelector(`.note-container[data-id="${id}"]`);
    note.remove();
};

document.addEventListener('DOMContentLoaded', () => {
    signInBtn.addEventListener('click', signIn);
    signOutBtn.addEventListener('click', signOut);
    addNewNoteBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
    });
});