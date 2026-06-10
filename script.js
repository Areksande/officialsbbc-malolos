// --- Slider Navigation ---
document.querySelectorAll('.slider-nav a').forEach((dot, index) => {
    dot.addEventListener('click', e => {
        e.preventDefault(); // Stop page from jumping
        const slider = document.querySelector('.slider');
        // Check if slider exists to prevent null reference errors
        if (slider) {
            slider.scrollLeft = slider.offsetWidth * index; // Scroll to slide
        }
    });
});

// --- Bible API ---
function getVerse() {
    const verse = document.getElementById("verse").value.trim();
    const resultContainer = document.getElementById("result");

    if (!verse) {
        resultContainer.innerHTML = "Please enter a verse.";
        return;
    }

    // Fixed template literal syntax (added $ and /) and added URL encoding
    fetch(`https://bible-api.com/${encodeURIComponent(verse)}?translation=kjv`)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            resultContainer.innerHTML = `
                <p><strong>${data.reference}</strong> <em>${data.translation_name}</em></p> 
                <p>${data.text}</p>
            `;
        })
        .catch(error => {
            resultContainer.innerHTML = "Verse not found or network error.";
            console.error('Fetch Error:', error);
        });
}

// --- Quick Notes App ---
let notes = [];
let editingNoteId = null;

function loadNotes() {
    const savedNotes = localStorage.getItem('quickNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
}

function saveNotes() {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
}

function generateId() {
    return Date.now().toString();
}

function saveNote(event) {
    event.preventDefault();
    event.stopImmediatePropagation(); // Prevents double submission if triggered twice

    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    // Basic validation to prevent saving empty notes
    if (!title && !content) return;

    if (editingNoteId) {
        const noteIndex = notes.findIndex(note => note.id === editingNoteId);
        if (noteIndex > -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title, 
                content
            };
        }
    } else {
        notes.unshift({
            id: generateId(),
            title,
            content
        });
    }

    closeNoteDialog();
    saveNotes();
    renderNotes();
}

function renderNotes() {
    const notesContainer = document.getElementById("notesContainer");
    
    if (!notesContainer) return; // Guard clause

    // Clear existing notes
    notesContainer.innerHTML = "";

    notes.forEach(note => {
        const noteCard = document.createElement("div");
        noteCard.className = "note-card";

        noteCard.innerHTML = `
            <h3 class="note-title"></h3>
            <p class="note-content"></p>
            <div class="note-actions">
                <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;

        // Safely inject text values without executing HTML code
        noteCard.querySelector('.note-title').textContent = note.title;
        noteCard.querySelector('.note-content').textContent = note.content;

        // Add card to grid
        notesContainer.appendChild(noteCard);
    });
}

function deleteNote(noteId) {
    // Used strict inequality (!==) instead of loose (!=)
    notes = notes.filter(note => note.id !== String(noteId));
    saveNotes();
    renderNotes();
}

function openNoteDialog(noteId = null) {
    const dialog = document.getElementById('noteDialog');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const dialogTitle = document.getElementById('dialogTitle');
        
    if (noteId) {
        const noteToEdit = notes.find(note => note.id === noteId);
        if (noteToEdit) {
            editingNoteId = noteId;
            dialogTitle.textContent = 'Edit Note';
            titleInput.value = noteToEdit.title;
            contentInput.value = noteToEdit.content;
        }
    } else {
        editingNoteId = null;
        dialogTitle.textContent = 'Add New Note';
        titleInput.value = '';
        contentInput.value = '';
    }

    dialog.showModal();
    titleInput.focus();
}

function closeNoteDialog() {
    const dialog = document.getElementById('noteDialog');
    if (dialog) dialog.close();
}

// --- Theme & Initialization ---
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    notes = loadNotes();
    renderNotes();

    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
        // Using addEventListener is standard practice over element.onsubmit
        noteForm.addEventListener('submit', saveNote); 
    }

    const noteDialog = document.getElementById('noteDialog');
    if (noteDialog) {
        // Close dialog if clicking outside the modal box
        noteDialog.addEventListener('click', function (event) {
            if (event.target === this) {
                closeNoteDialog();
            }
        });
    }
});
