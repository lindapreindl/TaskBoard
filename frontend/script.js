const API_URL = "http://localhost:3000/todos";

let todos = [];
let selectedDate = "";

// Initialisiert die Anwendung beim Laden der Seite
window.onload = () => {

    // Heutiges Datum ermitteln
    const today = new Date().toISOString().split("T")[0];

    // Erlaubten Datumsbereich auf ±7 Tage begrenzen
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 7);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);

    document.getElementById("datePicker").min =
        minDate.toISOString().split("T")[0];

    document.getElementById("datePicker").max =
        maxDate.toISOString().split("T")[0];

    selectedDate = today;

    document.getElementById("datePicker").value = today;

    document
        .getElementById("datePicker")
        .addEventListener("change", (event) => {

            selectedDate = event.target.value;
            loadTodos();
        });

    // Enter-Taste fügt eine neue Aufgabe hinzu
    document
        .getElementById("todoinput")
        .addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                addTodo();
            }
        });

    cleanupOldTodos();
    loadTodos();
};

// Lädt alle Aufgaben des aktuell ausgewählten Datums
async function loadTodos() {

    const response = await fetch(API_URL);
    const data = await response.json();

    todos = data.filter(todo => todo.date === selectedDate);

    todos.sort((a, b) => a.completed - b.completed);

    render();
}

// Zeigt die geladenen Aufgaben in der Aufgabenliste an
function render() {

    const list = document.getElementById("todoList");

    list.innerHTML = "";

    todos.forEach(todo => {

        list.innerHTML += `
            <li>

                <input
                    type="checkbox"
                    ${todo.completed ? "checked" : ""}
                    onchange="toggleTodo('${todo.id}', ${todo.completed})"
                >

                <span class="${todo.completed ? "completed" : ""}">
                    ${todo.title}
                </span>

                <button onclick="editTodo('${todo.id}')">
                    Bearbeiten
                </button>

                <button onclick="deleteTodo('${todo.id}')">
                    Löschen
                </button>

            </li>
        `;
    });
}

// Erstellt eine neue Aufgabe für das ausgewählte Datum
async function addTodo() {

    const input = document.getElementById("todoinput");

    const title = input.value.trim();

    if (!title) {
        return;
    }

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            completed: false,
            date: selectedDate
        })
    });

    input.value = "";

    await loadTodos();
}

// Löscht eine Aufgabe nach Bestätigung durch den Benutzer
async function deleteTodo(id) {

    const confirmed = confirm(
        "Aufgabe wirklich löschen?"
    );

    if (!confirmed) {
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    await loadTodos();
}

// Bearbeitet den Titel einer bestehenden Aufgabe
async function editTodo(id) {

    const todo = todos.find(
        t => String(t.id) === String(id)
    );

    if (!todo) {
        alert("Aufgabe nicht gefunden");
        return;
    }

    const newTitle = prompt(
        "Neuer Titel:",
        todo.title
    );

    if (!newTitle || !newTitle.trim()) {
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: newTitle.trim()
        })
    });

    await loadTodos();
}

// Ändert den Erledigt-Status einer Aufgabe
async function toggleTodo(id, completed) {

    await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: !completed
        })
    });

    await loadTodos();
}

// Öffnet bzw. schließt das Archiv und zeigt verfügbare Archivdaten an
async function showArchive() {

    const container =
        document.getElementById("archiveContainer");

    const list =
        document.getElementById("archiveList");

    const todoList =
        document.getElementById("todoList");

    const addTaskContainer =
        document.getElementById("addTaskContainer");

    const isOpening =
        container.classList.contains("hidden");

    if (isOpening) {

        container.classList.remove("hidden");

        todoList.classList.add("hidden");

        addTaskContainer.classList.add("hidden");

    } else {

        container.classList.add("hidden");

        todoList.classList.remove("hidden");

        addTaskContainer.classList.remove("hidden");

        return;
    }

    const response = await fetch(API_URL);
    const data = await response.json();

    const today = new Date();

    list.innerHTML = "";

    const dates = [...new Set(
        data.map(todo => todo.date)
    )];

    dates.sort((a, b) => new Date(b) - new Date(a));

    dates.forEach(date => {

        const currentDate = new Date(date);

        const taskCount =
            data.filter(todo => todo.date === date).length;

        const diffDays = Math.floor(
            (currentDate - today) /
            (1000 * 60 * 60 * 24)
        );

        const isClickable =
            diffDays >= -7 &&
            diffDays <= 7;

        list.innerHTML += `
            <li
                class="${
                    isClickable
                        ? "archive-date"
                        : "archive-date-disabled"
                }"
                ${
                    isClickable
                        ? `onclick="loadArchiveDate('${date}')"`
                        : ""
                }
            >
                ${formatDate(date)}
                (${taskCount} Aufgaben)
            </li>
        `;
    });
}

// Lädt die Aufgaben eines ausgewählten Archivdatums
async function loadArchiveDate(date) {

    selectedDate = date;

    document.getElementById("datePicker").value = date;

    document
        .getElementById("archiveContainer")
        .classList.add("hidden");

    document
        .getElementById("todoList")
        .classList.remove("hidden");

    document
        .getElementById("addTaskContainer")
        .classList.remove("hidden");

    await loadTodos();
}

// Formatiert ein Datum in das österreichische Datumsformat
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "de-AT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

// Entfernt Aufgaben, die älter als sieben Tage sind
async function cleanupOldTodos() {

    const response = await fetch(API_URL);
    const data = await response.json();

    const today = new Date();

    data.forEach(async (todo) => {

        const todoDate = new Date(todo.date);

        const diff =
            (today - todoDate) /
            (1000 * 60 * 60 * 24);

        if (diff > 7) {

            await fetch(`${API_URL}/${todo.id}`, {
                method: "DELETE"
            });
        }
    });
}