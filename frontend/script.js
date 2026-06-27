const API_URL = "http://localhost:3000/todos";

let todos = [];
let selectedDate = "";

// initializes the app when loading the site
window.onload = () => {

    // determines the current date
    const today = new Date().toISOString().split("T")[0];

    // restricts date range to +/- 7 days
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

    // enter button adds also a new to do
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

// loads all tasks of the chosen date
async function loadTodos() {

    const response = await fetch(API_URL);
    const data = await response.json();

    todos = data.filter(todo => todo.date === selectedDate);

    todos.sort((a, b) => a.completed - b.completed);

    render();
}

// shows the tasks loaded as a list
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
                    edit
                </button>

                <button onclick="deleteTodo('${todo.id}')">
                    delete
                </button>

            </li>
        `;
    });
}

// creates a new task for the chosen date
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

// deletes a task after confirmation of the user
async function deleteTodo(id) {

    const confirmed = confirm(
        "Delete this task irretrievably?"
    );

    if (!confirmed) {
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    await loadTodos();
}

// changes the title alias text of the task
async function editTodo(id) {

    const todo = todos.find(
        t => String(t.id) === String(id)
    );

    if (!todo) {
        alert("Task not found");
        return;
    }

    const newTitle = prompt(
        "New task:",
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

// changes completion state of a task
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

// opens the archive
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
                (${taskCount} tasks)
            </li>
        `;
    });
}

// loads the tasks of a date chosen from the archive
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

// formats dates into european date formats
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

// deletes tasks older than seven days
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