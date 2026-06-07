let todos = [];


function addTodo(){
    let todoText = document.getElementById('todoinput').value;

    todos.push(todoText);

    document.getElementById('todoinput').value = '';
    save();
    render();

}

function render (){
    document.getElementById('todoList').innerHTML = '';
    todos.forEach(todo => todoList.innerHTML += `<li>${todo}</li>`);

}

async function loadTodos(){
    const url = `http://localhost:3000/todos`;
    let response = await fetch(url);
    todos = await response.json();
    render();
}

function save(){
    fetch('url',{
        body: JSON.stringify(todos),
        method: 'POST'
    });
}