// Persisted To-Do List with Local Storage
// Usage: requires elements with IDs: add-task-btn, task-input, task-list

document.addEventListener('DOMContentLoaded', () => {
  // Select DOM elements
  const addButton = document.getElementById('add-task-btn');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');

  // In-memory tasks array (each task is { id: string, text: string })
  let tasks = [];

  // Save tasks array to localStorage
  function saveTasks() {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
    }
  }

  // Create a task <li> element from a task object
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;               // store id on element for easy lookup

    // task text (use a span so we can separate text from the remove button)
    const span = document.createElement('span');
    span.textContent = task.text;
    li.appendChild(span);

    // remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';

    // remove handler - removes DOM element and updates local storage
    removeBtn.addEventListener('click', () => {
      removeTask(task.id);
    });

    li.appendChild(removeBtn);
    return li;
  }

  // Add a task. If taskText is provided we use it; otherwise we use the input value.
  // save parameter controls whether the task should be saved to localStorage (true by default).
  function addTask(taskText = undefined, save = true) {
    const text = (taskText !== undefined) ? String(taskText).trim() : taskInput.value.trim();

    if (text === '') {
      alert('Please enter a task!');
      return;
    }

    // Create a new task object with a unique id (timestamp)
    const task = {
      id: Date.now().toString(),
      text: text
    };

    // Add to in-memory array and DOM
    tasks.push(task);
    const li = createTaskElement(task);
    taskList.appendChild(li);

    // Save to localStorage if requested
    if (save) saveTasks();

    // Clear input and focus for convenience
    taskInput.value = '';
    taskInput.focus();
  }

  // Remove a task by id: update tasks array, update storage and DOM
  function removeTask(taskId) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return; // nothing to do

    // Remove from array and update storage
    tasks.splice(index, 1);
    saveTasks();

    // Remove from DOM
    const li = taskList.querySelector(`li[data-id="${taskId}"]`);
    if (li) li.remove();
  }

  // Load tasks from localStorage and populate the DOM
  function loadTasks() {
    try {
      const raw = localStorage.getItem('tasks') || '[]';
      const parsed = JSON.parse(raw);

      // Normalize stored data to array of {id, text}
      // Support both previous formats (strings) and objects
      tasks = Array.isArray(parsed) ? parsed.map(item => {
        if (typeof item === 'string') {
          // older format: string of task text -> create object with new id
          return { id: Date.now().toString() + Math.random().toString(36).slice(2,7), text: item };
        }
        // assume object {id, text}
        return { id: String(item.id || Date.now()), text: String(item.text || '') };
      }) : [];

      // Render each task in the DOM
      tasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
      });

      // Make sure we persist any normalization we did (so stored format is consistent)
      saveTasks();
    } catch (err) {
      console.error('Failed to load tasks from localStorage:', err);
      tasks = [];
    }
  }

  // Initialization
  loadTasks();

  // Event listeners
  addButton.addEventListener('click', () => addTask());
  taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  });
});

