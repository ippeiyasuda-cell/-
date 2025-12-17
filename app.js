const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

const STORAGE_KEY = 'todos';

let todos = loadTodos();

function loadTodos() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
    list.innerHTML = '';

    if (todos.length === 0) {
        list.innerHTML = '<li class="empty-message">タスクがありません</li>';
        return;
    }

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn">削除</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleComplete(index));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(index));

        list.appendChild(li);
    });
}

function addTodo(text) {
    todos.push({ text, completed: false });
    saveTodos();
    render();
}

function toggleComplete(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    render();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    render();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        addTodo(text);
        input.value = '';
        input.focus();
    }
});

render();
