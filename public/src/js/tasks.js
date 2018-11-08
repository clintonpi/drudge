import { LOCAL_STORAGE_KEY } from '../../../constants';
import sanitizeStr from '../../../utils';

const TASK_STATUS = {
  TODO: 'todo',
  DONE: 'done'
};

const fetchTasks = () => {
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) return JSON.parse(taskStr);

  return [];
};

const countTasks = () => {
  const taskList = fetchTasks();
  const todoTasksLength = taskList.filter(task => task.taskStatus === TASK_STATUS.TODO).length;
  const doneTasksLength = taskList.filter(task => task.taskStatus === TASK_STATUS.DONE).length;

  document.querySelector('#todo-count').innerText = todoTasksLength;
  document.querySelector('#done-count').innerText = doneTasksLength;

  (() => {
    const infoWrap = document.querySelector('#info-wrap').style;
    const stackStyle = document.querySelector('#stack').style;
    const displayNone = 'none';

    if (taskList.length > 1) {
      infoWrap.display = 'flex';
      stackStyle.display = 'block';

      const removeCompletedBtnStyle = document.querySelector('#info-wrap button').style;

      if (doneTasksLength > 1) {
        removeCompletedBtnStyle.display = 'inline';
        return;
      }

      removeCompletedBtnStyle.display = displayNone;

      return;
    }

    infoWrap.display = displayNone;
    stackStyle.display = displayNone;
  })();
};

const saveTask = (taskObject) => {
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  let taskList = [];

  if (taskStr) taskList = JSON.parse(taskStr);

  taskList.push(taskObject);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(taskList));

  countTasks();
};

const removeTask = (taskId) => {
  const task = document.querySelector(`#${taskId}`);
  document.querySelector('#task-container').removeChild(task);

  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) {
    const taskList = JSON.parse(taskStr);
    const filteredList = taskList.filter(item => item.taskId !== taskId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
  }

  countTasks();
};

const removeCompletedTasks = () => {
  const taskList = fetchTasks();

  if (taskList.length > 0) {
    taskList.forEach((task) => {
      if (task.taskStatus === TASK_STATUS.DONE) removeTask(task.taskId);
    });
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

const taskStatusAction = (taskId, statusToAssign) => {
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  const taskList = JSON.parse(taskStr);
  const filteredList = taskList
    .map(item => (item.taskId === taskId ? Object.assign(item, {
      taskStatus: statusToAssign
    }) : item));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));

  countTasks();
};

const undoTask = (taskId) => {
  document.querySelector(`#${taskId}`).classList.remove('done-task');
  taskStatusAction(taskId, TASK_STATUS.TODO);
};

const handleCompletedTask = (taskId) => {
  document.querySelector(`#${taskId}`).classList.add('done-task');
};

const completeTask = (taskId) => {
  handleCompletedTask(taskId);
  taskStatusAction(taskId, TASK_STATUS.DONE);
};

const createTask = (taskName, taskId = `task-${new Date().getTime()}`, taskStatus = TASK_STATUS.TODO) => {
  const id = 'id';
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.setAttribute(id, taskId);

  const toggleTaskId = `toggle-${taskId}`;
  const toggle = document.createElement('input');
  toggle.setAttribute('type', 'checkbox');
  toggle.setAttribute(id, toggleTaskId);
  toggle.classList.add('toggle');
  if (taskStatus === TASK_STATUS.DONE) toggle.checked = true;
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      completeTask(taskId);
      return;
    }
    undoTask(taskId);
  });

  const marker = document.createElement('label');
  marker.setAttribute('for', toggleTaskId);
  marker.classList.add('marker');
  marker.innerText = '✓';

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

  taskElement.appendChild(toggle);
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

  return { taskId, taskStatus };
};

export {
  saveTask, fetchTasks, removeCompletedTasks, countTasks, addTaskToDOM
};
