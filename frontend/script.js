/*let todos = [];

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
*/


const API_URL = "http://localhost:3000/todos";

let todos = [];
let selectedDate = "";

window.onload = () => {

    const today = new Date().toISOString().split("T")[0];

    selectedDate = today;

    document.getElementById("datePicker").value = today;

    document
        .getElementById("datePicker")
        .addEventListener("change", (event) => {

            selectedDate = event.target.value;
            loadTodos();
        });

    document
        .getElementById("todoinput")
        .addEventListener("keydown", (event) => {

            if(event.key === "Enter"){
                addTodo();
            }
        });

    cleanupOldTodos();
    loadTodos();
};

async function loadTodos(){

    const response = await fetch(API_URL);
    const data = await response.json();

    todos = data.filter(todo => todo.date === selectedDate);

    todos.sort((a,b) => a.completed - b.completed);

    render();
}

function render(){

    const list = document.getElementById("todoList");

    list.innerHTML = "";

    todos.forEach(todo => {

        list.innerHTML += `
            <li>

                <input
                    type="checkbox"
                    ${todo.completed ? "checked" : ""}
                    onchange="toggleTodo(${todo.id}, ${todo.completed})"
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

async function addTodo(){

    const input = document.getElementById("todoinput");

    const title = input.value.trim();

    if(!title){
        return;
    }

    await fetch(API_URL, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            title:title,
            completed:false,
            date:selectedDate
        })
    });

    input.value = "";

    loadTodos();
}

async function deleteTodo(id){

    await fetch(`${API_URL}/${id}`,{
        method:"DELETE"
    });

    loadTodos();
}

async function editTodo(id){

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

    if(!newTitle){
        return;
    }

    await fetch(`${API_URL}/${id}`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            title:newTitle
        })
    });

    loadTodos();
}

async function toggleTodo(id, completed){

    await fetch(`${API_URL}/${id}`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            completed:!completed
        })
    });

    loadTodos();
}

async function showArchive(){

    const container =
        document.getElementById("archiveContainer");

    const list =
        document.getElementById("archiveList");

    container.classList.toggle("hidden");

    const response = await fetch(API_URL);

    const data = await response.json();

    const today = new Date();

    list.innerHTML = "";

    const dates = [...new Set(
        data.map(todo => todo.date)
    )];

    dates.forEach(date => {

        const currentDate = new Date(date);

        const diff =
            (today - currentDate) /
            (1000 * 60 * 60 * 24);

        if(diff > 0 && diff <= 7){

            list.innerHTML += `
                <li>${date}</li>
            `;
        }
    });
}

async function cleanupOldTodos(){

    const response = await fetch(API_URL);

    const data = await response.json();

    const today = new Date();

    data.forEach(async(todo)=>{

        const todoDate = new Date(todo.date);

        const diff =
            (today - todoDate) /
            (1000 * 60 * 60 * 24);

        if(diff > 7){

            await fetch(`${API_URL}/${todo.id}`,{
                method:"DELETE"
            });
        }
    });
}