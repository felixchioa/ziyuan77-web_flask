// 获取DOM元素
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const tasksCount = document.getElementById('tasks-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// 当前过滤器
let currentFilter = 'all';

// 任务数组
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 添加事件监听
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
});
clearCompletedBtn.addEventListener('click', clearCompleted);

// 为过滤按钮添加事件监听
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// 添加任务
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    
    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    
    taskInput.value = '';
    taskInput.focus();
}

// 切换任务状态
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// 删除任务
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// 编辑任务
function editTask(id, element) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    element.contentEditable = true;
    element.focus();
    
    // 选中全部文本
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    function saveEdit() {
        element.contentEditable = false;
        task.text = element.textContent.trim();
        if (!task.text) {
            deleteTask(id);
        } else {
            saveTasks();
        }
    }
    
    element.addEventListener('blur', saveEdit);
    element.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            element.blur();
        }
    });
}

// 清除已完成任务
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 渲染任务列表
function renderTasks() {
    // 过滤任务
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // 清空任务列表
    taskList.innerHTML = '';
    
    // 渲染任务
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="delete-btn">删除</button>
        `;
        
        // 添加事件监听
        const checkbox = taskElement.querySelector('.task-checkbox');
        const textElement = taskElement.querySelector('.task-text');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTask(task.id));
        textElement.addEventListener('dblclick', () => editTask(task.id, textElement));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(taskElement);
    });
    
    // 更新任务计数
    const activeCount = tasks.filter(task => !task.completed).length;
    tasksCount.textContent = `${activeCount} 个任务`;
}

// 初始渲染
renderTasks(); 