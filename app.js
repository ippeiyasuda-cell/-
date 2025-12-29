const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const clearBtn = document.getElementById('clear-completed');

const STORAGE_KEY = 'todos';
const FORBIDDEN_TASK = '神の禁忌';
const JUMPSCARE_THRESHOLD = 30;

let todos = loadTodos();
let jumpscareTriggered = false;

function loadTodos() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;

    animateNumber(totalCount, total);
    animateNumber(completedCount, completed);
    animateNumber(pendingCount, pending);

    clearBtn.disabled = completed === 0;
}

function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    if (current === target) return;

    const duration = 300;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(current + (target - current) * eased);

        element.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function render() {
    list.innerHTML = '';

    if (todos.length === 0) {
        list.innerHTML = `
            <li class="empty-message">
                <i class="fas fa-clipboard-list"></i>
                タスクがありません
            </li>
        `;
        updateStats();
        return;
    }

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.style.animationDelay = `${index * 0.05}s`;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
                削除
            </button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleComplete(index));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(index, li));

        list.appendChild(li);
    });

    updateStats();
}

function addTodo(text) {
    todos.push({ text, completed: false });
    saveTodos();
    render();
    checkJumpscare();
}

function toggleComplete(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    render();
}

function deleteTodo(index, element) {
    element.classList.add('removing');

    setTimeout(() => {
        todos.splice(index, 1);
        saveTodos();
        render();
        checkJumpscare();
    }, 300);
}

function clearCompleted() {
    const items = document.querySelectorAll('.todo-item.completed');
    items.forEach((item, i) => {
        setTimeout(() => {
            item.classList.add('removing');
        }, i * 50);
    });

    setTimeout(() => {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        render();
        checkJumpscare();
    }, items.length * 50 + 300);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function countForbiddenTasks() {
    return todos.filter(t => t.text === FORBIDDEN_TASK).length;
}

function checkJumpscare() {
    const count = countForbiddenTasks();

    // 29個以下になったらフラグをリセット（再発動可能に）
    if (count < JUMPSCARE_THRESHOLD) {
        jumpscareTriggered = false;
        return;
    }

    // 30個以上かつ未発動なら発動
    if (count >= JUMPSCARE_THRESHOLD && !jumpscareTriggered) {
        jumpscareTriggered = true;
        triggerJumpscare();
    }
}

function triggerJumpscare() {
    const overlay = document.createElement('div');
    overlay.className = 'jumpscare-overlay';
    overlay.innerHTML = `
        <div class="jumpscare-oni">👹</div>
        <div class="jumpscare-text">禁忌を犯しすぎた...</div>
    `;
    document.body.appendChild(overlay);

    // 効果音的な振動
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // 画面を揺らす
    document.body.classList.add('shake');

    setTimeout(() => {
        overlay.classList.add('fade-out');
        document.body.classList.remove('shake');
        setTimeout(() => {
            overlay.remove();
            jumpscareTriggered = false;
        }, 500);
    }, 2500);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        if (text === 'りんご') {
            alert('エラー: 「りんご」は禁止されています');
            for (let i = 0; i < 20; i++) {
                addTodo('神の禁忌');
            }
        } else {
            addTodo(text);
        }
        input.value = '';
        input.focus();
    }
});

clearBtn.addEventListener('click', clearCompleted);

render();
