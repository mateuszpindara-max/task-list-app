const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const counter = document.getElementById('task-counter');
const clearCompletedButton = document.getElementById('clear-completed');

const STORAGE_KEY = 'task-list-items';
const ICON_PATH = 'assets/icons';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function createIcon(name) {
  const icon = document.createElement('img');
  icon.src = `${ICON_PATH}/${name}.svg`;
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  icon.className = 'button-icon';
  return icon;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateCounter() {
  const total = tasks.length;
  const remaining = tasks.filter((task) => !task.completed).length;
  counter.textContent = `${remaining} of ${total} task${total === 1 ? '' : 's'} left`;
}

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No tasks yet. Add your first one above!';
    taskList.appendChild(emptyState);
    updateCounter();
    return;
  }

  tasks.forEach((task) => {
    const listItem = document.createElement('li');
    listItem.className = `task-item ${task.completed ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.text} as complete`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const editField = document.createElement('div');
    editField.className = 'task-edit-field';
    editField.hidden = true;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;
    editInput.hidden = true;
    editInput.setAttribute('aria-label', `Edit task ${task.text}`);

    let cancelEditButton = null;

    const ensureCancelButton = () => {
      if (!cancelEditButton) {
        cancelEditButton = document.createElement('button');
        cancelEditButton.type = 'button';
        cancelEditButton.className = 'cancel-edit-btn';
        cancelEditButton.title = `Cancel editing ${task.text}`;
        cancelEditButton.setAttribute('aria-label', `Cancel editing ${task.text}`);
        cancelEditButton.appendChild(createIcon('close'));
        cancelEditButton.addEventListener('click', () => {
          cancelEditing();
        });
        editField.appendChild(cancelEditButton);
      }
    };

    const startEditing = () => {
      editInput.value = task.text;
      ensureCancelButton();
      editField.hidden = false;
      editInput.hidden = false;
      cancelEditButton.hidden = false;
      text.hidden = true;
      editButton.title = `Save ${task.text}`;
      editButton.setAttribute('aria-label', `Save ${task.text}`);
      editButton.innerHTML = '';
      editButton.appendChild(createIcon('save'));
      listItem.classList.add('editing');
      editInput.focus();
      editInput.select();
    };

    const cancelEditing = () => {
      editInput.value = task.text;
      editField.hidden = true;
      editInput.hidden = true;
      if (cancelEditButton) {
        cancelEditButton.hidden = true;
        cancelEditButton.remove();
        cancelEditButton = null;
      }
      text.hidden = false;
      editButton.title = `Edit ${task.text}`;
      editButton.setAttribute('aria-label', `Edit ${task.text}`);
      editButton.innerHTML = '';
      editButton.appendChild(createIcon('edit'));
      listItem.classList.remove('editing');
    };

    const saveEditing = () => {
      const cleanText = editInput.value.trim();

      if (!cleanText) {
        window.alert('Task cannot be empty.');
        editInput.focus();
        return;
      }

      task.text = cleanText;
      saveTasks();
      renderTasks();
    };

    editInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        saveEditing();
      }

      if (event.key === 'Escape') {
        cancelEditing();
      }
    });

    editField.appendChild(editInput);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'edit-btn icon-button';
    editButton.title = `Edit ${task.text}`;
    editButton.setAttribute('aria-label', `Edit ${task.text}`);
    editButton.appendChild(createIcon('edit'));
    editButton.addEventListener('click', () => {
      if (editInput.hidden) {
        startEditing();
        return;
      }

      saveEditing();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn icon-button';
    deleteButton.title = `Delete ${task.text}`;
    deleteButton.setAttribute('aria-label', `Delete ${task.text}`);
    deleteButton.appendChild(createIcon('delete'));
    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    listItem.appendChild(checkbox);
    listItem.appendChild(text);
    listItem.appendChild(editField);
    listItem.appendChild(actions);
    taskList.appendChild(listItem);
  });

  updateCounter();
}

function addTask(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: Date.now().toString(),
    text: cleanText,
    completed: false,
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
