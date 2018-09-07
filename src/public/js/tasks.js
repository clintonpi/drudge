import { LOCAL_STORAGE_KEY } from '../../../constants';
import countTasks from './count';
import sanitizeStr from './utils';

const TASK_STATUS = {
  TODO: 'todo',
  DONE: 'done'
};

const saveTask = (taskObject) => {
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  let taskList = [];

  if (taskStr) taskList = JSON.parse(taskStr);

  taskList.push(taskObject);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(taskList));
};

const removeTask = (taskId) => {
  const task = document.querySelector(`#${taskId}`);
  document.querySelector('#task-container').removeChild(task);
  countTasks();

  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) {
    const taskList = JSON.parse(taskStr);
    const filteredList = taskList.filter(item => item.taskId !== taskId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
  }
};

const editTask = (taskId) => {
  const taskNameSpan = document.querySelectorAll(`#${taskId} .task-name`)[0];
  taskNameSpan.setAttribute('contenteditable', 'true');
  taskNameSpan.focus();
  const fallbackText = taskNameSpan.innerText;

  taskNameSpan.addEventListener('blur', () => {
    taskNameSpan.setAttribute('contenteditable', 'false');
    const taskName = sanitizeStr(taskNameSpan.innerText);
    taskNameSpan.innerText = taskName;

    if (taskName.length < 1) {
      taskNameSpan.innerText = fallbackText;
      return;
    }

    // remove from local storage but not from DOM because task will be resaved
    const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    const taskList = JSON.parse(taskStr);
    const filteredList = taskList
      .map(item => (item.taskId === taskId ? Object.assign(item, { taskName }) : item));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
  });

  taskNameSpan.addEventListener('keydown', (e) => {
    if (e.which === 13) {
      taskNameSpan.blur();
    }
  });
};

const handleCompletedTask = (taskId) => {
  document.querySelector(`#${taskId}`).classList.add('done-task');
};

const completeTask = (taskId) => {
  handleCompletedTask(taskId);

  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  const taskList = JSON.parse(taskStr);
  const filteredList = taskList
    .map(item => (item.taskId === taskId ? Object.assign(item, {
      taskStatus: TASK_STATUS.DONE
    }) : item));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
};

const createTask = (taskName, taskId = `task-${new Date().getTime()}`, taskStatus = TASK_STATUS.TODO) => {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.setAttribute('id', taskId);

  const marker = document.createElement('button');
  marker.classList.add('marker');
  marker.innerText = '✓';
  marker.addEventListener('click', () => {
    completeTask(taskId);
  });

  const span = document.createElement('span');
  span.classList.add('task-name');
  span.setAttribute('spellcheck', 'false');
  span.innerText = taskName;

  const edit = document.createElement('button');
  edit.classList.add('edit');
  edit.innerText = '✎';
  edit.addEventListener('click', () => {
    editTask(taskId);
  });

  const remove = document.createElement('button');
  remove.classList.add('remove');
  remove.innerText = '✕';
  remove.addEventListener('click', () => {
    removeTask(taskId);
  });

  taskElement.appendChild(marker);
  taskElement.appendChild(span);
  taskElement.appendChild(edit);
  taskElement.appendChild(remove);

  return { taskId, taskElement, taskStatus };
};

const addTaskToDOM = (taskName, id, status) => {
  const { taskId, taskElement, taskStatus } = createTask(taskName, id, status);

  const taskContainer = document.querySelector('#task-container');
  taskContainer.appendChild(taskElement);

  if (taskStatus === TASK_STATUS.DONE) {
    handleCompletedTask(taskId);
  }

  countTasks();
  return { taskId, taskStatus };
};

const fetchTasks = () => {
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) return JSON.parse(taskStr);

  return [];
};

export { saveTask, addTaskToDOM, fetchTasks };
