let todos = [];


function addTodo(){
    let todoText = document.getElementById('todoinput').value;

    todos.push(todoText);

    document.getElementById('todoinput').value = '';
    save();
    render();

}



async function loadTodos(){
    const url = `http://localhost:3000/todos`;
    let response = await fetch(url);
    let data = await response.json();
    render(data);
}

function render (data){
    let todos = data.map(todo => todo.title);

    let todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    todos.forEach(todo => todoList.innerHTML += `<li>${todo}</li>`);

}

function save(){
    fetch(`http://localhost:3000/todos`,{
        body: JSON.stringify(todos),
        method: 'POST'
    });
}