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
    const note = `
        <div class="note-container" data-id="${id}">
            <header class="note-header">
                <h4 class="note-title">${noteInfo.title}</h4>
                <button class="delete-btn" data-id="${id}"><svg version="1.1" data-id="${id}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                width="16px" height="16px" viewBox="0 0 459 459" style="enable-background:new 0 0 459 459;" xml:space="preserve"><g><g id="delete">
                   <path data-id="${id}" d="M76.5,408c0,28.05,22.95,51,51,51h204c28.05,0,51-22.95,51-51V102h-306V408z M408,25.5h-89.25L293.25,0h-127.5l-25.5,25.5
                       H51v51h357V25.5z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg></button>
            </header>
            <p class="note-content">${noteInfo.note}</p>
        </div>
    `
    
    noteContainer.innerHTML += note;
}

//get localNotes
const localNotes = JSON.parse(localStorage.getItem('notes')) || [];
let id = localNotes.length === 0 ? 0 : localNotes[localNotes.length - 1].id;
let storageRef = '';
let database = undefined;

function storeNote(e) {
    e.preventDefault();
    
    if (storageRef === 'localStorage') {
        id++;
        const note = {
            title: form.title.value,
            note: form.note.value,
            id: id
        }
        localNotes.push(note);
        localStorage.setItem('notes', JSON.stringify(localNotes));
        renderNewNote(note, id);
        console.log(id);
    }
    if (storageRef === 'database') {
        const note = {
            title: form.title.value,
            note: form.note.value
        };
        database.add(note);
    }
    form.reset();
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

const sidebarMask = document.querySelector('.sidebar-mask');
const sidebar = document.querySelector('.sidebar');

document.addEventListener('DOMContentLoaded', () => {
    signInBtn.addEventListener('click', signIn);
    signOutBtn.addEventListener('click', signOut);

    addNewNoteBtn.addEventListener('click', () => {
        form.title.select();
        sidebar.classList.toggle('open');
        addNewNoteBtn.classList.toggle('rotate');
        sidebarMask.classList.toggle('sidebar-mask-open');
    });

    sidebarMask.addEventListener('click', function() {
        this.classList.remove('sidebar-mask-open');
        sidebar.classList.remove('open');
        addNewNoteBtn.classList.remove('rotate');
    });

    switchToggle.addEventListener('change', switchTheme);
    form.addEventListener('submit', e => storeNote(e));
});

