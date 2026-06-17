let todos = [];

async function loadTodos() {
    try {
        const response = await fetch('http://localhost:3000/todos');
        todos = await response.json();
        render();
    } catch (error) {
        console.error('Fehler beim Laden:', error);
    }
}

function render() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    todos.forEach(todo => {
        todoList.innerHTML += `
            <li>
                <span>${todo.title}</span>

                <button onclick="editTodo(${todo.id}, '${todo.title.replace(/'/g, "\\'")}')">
                    Bearbeiten
                </button>

                <button onclick="deleteTodo(${todo.id})">
                    Löschen
                </button>
            </li>
        `;
    });
}

async function addTodo() {
    const input = document.getElementById('todoinput');
    const title = input.value.trim();

    if (!title) return;

    try {
        await fetch('http://localhost:3000/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title
            })
        });

        input.value = '';
        await loadTodos();

    } catch (error) {
        console.error('Fehler beim Speichern:', error);
    }
}

async function deleteTodo(id) {
    try {
        await fetch(`http://localhost:3000/todos/${id}`, {
            method: 'DELETE'
        });

        await loadTodos();

    } catch (error) {
        console.error('Fehler beim Löschen:', error);
    }
}

async function editTodo(id, currentTitle) {
    const newTitle = prompt('Neuen Text eingeben:', currentTitle);

    if (newTitle === null) return;

    if (newTitle.trim() === '') return;

    try {
        await fetch(`http://localhost:3000/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: newTitle.trim()
            })
        });

        await loadTodos();

    } catch (error) {
        console.error('Fehler beim Bearbeiten:', error);
    }
}

window.onload = () => {
    loadTodos();

    document
        .getElementById('todoinput')
        .addEventListener('keydown', function (event) {

            if (event.key === 'Enter') {
                addTodo();
            }
        });
};