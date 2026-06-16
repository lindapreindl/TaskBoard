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
        todoList.innerHTML += `<li>${todo.title}</li>`;
    });
}

async function addTodo() {
    const input = document.getElementById('todoinput');
    const todoText = input.value.trim();

    if (!todoText) return;

    try {
        await fetch('http://localhost:3000/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: todoText
            })
        });

        input.value = '';

        await loadTodos();
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
    }
}
