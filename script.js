document.querySelectorAll('.slider-nav a').forEach((dot, index) => {
    dot.addEventListener('click', e => {
        e.preventDefault(); // stop page from jumping
        const slider = document.querySelector('.slider');
        slider.scrollLeft = slider.offsetWidth * index; // scroll to slide
    });
});


//Getting Bible API//
function getVerse() {
    const verse = document.getElementById("verse").value;

    fetch(`https://bible-api.com/${verse}?translation=kjv`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("result").innerHTML = `
                <p><strong>${data.reference}</strong> <em>${data.translation_name}</em></p> 
                <p>${data.text}</p>
                
            `;
        })
        .catch(error => {
            document.getElementById("result").innerHTML = "Verse not found.";
            console.error(error);
        });
}


//Notes//
let notes = [];
let editingNoteId = null;


function loadNotes() {
    const savedNotes = localStorage.getItem('quickNotes')
    return savedNotes ? JSON.parse(savedNotes) : []
}

function saveNote(event) {
    event.preventDefault();

    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if(editingNoteId){
        const noteIndex = notes.findIndex(note => note.id === editingNoteId)
        notes[noteIndex] = {
            ...notes[noteIndex],
            title, 
            content
        }

    } else {
        notes.unshift({
        id: generateId(),
        title,
        content
    });
    }

    console.log(notes);

    closeNoteDialog();
    saveNotes();
    renderNotes();
}

function generateId() {
    return Date.now().toString();
}

function saveNotes() {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
}
function renderNotes() {
     const notesContainer = document.getElementById("notesContainer");

    // Clear existing notes
    notesContainer.innerHTML = "";

    notes.forEach(note => {
        const noteCard = document.createElement("div");
        noteCard.className = "note-card";

        noteCard.innerHTML = `
            <h3 class="note-title">${note.title}</h3>
            <p class="note-content">${note.content}</p>

            <div class="note-actions">
                <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
                    <span class="material-symbols-outlined">edit</span>
                </button>

                <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;

        // Add card to grid
        notesContainer.appendChild(noteCard);
    });
}
       
    
    

function deleteNote(noteId){
    notes = notes.filter(note => note.id !=noteId)
    saveNotes();
    renderNotes();
}

function openNoteDialog(noteId = null) {
    const dialog = document.getElementById('noteDialog');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');

        
    if(noteId){
        const noteToEdit = notes.find(note => note.id === noteId);
        editingNoteId = noteId
        document.getElementById('dialogTitle').textContent = 'Edit Note'
        titleInput.value = noteToEdit.title
        contentInput.value = noteToEdit.content
        
    }
    //add
    else {
        editingNoteId = null
        document.getElementById('dialogTitle').textContent = 'Add New Note'
        titleInput.value = ''
        contentInput.value = ''
    }

    dialog.showModal();
    titleInput.focus();
}

function closeNoteDialog() {
    document.getElementById('noteDialog').close();
}

function toggleTheme(){
    document.body.classList.toggle('dark-theme')
}

document.addEventListener('DOMContentLoaded', function () {


    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    notes = loadNotes()
    renderNotes()

    document
        .getElementById('noteForm')
        .addEventListener('submit', saveNote);

    document
        .getElementById('noteDialog')
        .addEventListener('click', function (event) {
            if (event.target === this) {
                closeNoteDialog();
            }
        });
});
