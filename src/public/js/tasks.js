import { LOCAL_STORAGE_KEY } from '../../../constants';
import countTasks from './count';

const TASK_STATUS = {
  TODO: 'todo',
  DOING: 'doing'
};

const saveTask = (taskObject) => {
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  let taskList = [];

  if (taskStr) taskList = JSON.parse(taskStr);

  taskList.push(taskObject);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(taskList));
};

const removeTask = (taskId) => {
  const taskContainers = Array.from(document.querySelectorAll('.task-containers'));
  const task = document.querySelector(`#${taskId}`);
  taskContainers.forEach((taskContainer) => {
    if (task.parentElement === taskContainer) {
      taskContainer.removeChild(task);
      countTasks(taskContainer);
    }
  });

  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) {
    const taskList = JSON.parse(taskStr);
    const filteredList = taskList.filter(item => item.taskId !== taskId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
  }
};

const editTask = (taskId, taskStatus) => {
  const taskSpan = document.querySelector(`#${taskId} span`);
  taskSpan.setAttribute('contenteditable', 'true');
  taskSpan.focus();

  taskSpan.addEventListener('blur', () => {
    taskSpan.setAttribute('contenteditable', 'false');
    const taskName = taskSpan.innerText;

    // remove from local storage but not from DOM because task will be resaved
    const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    const taskList = JSON.parse(taskStr);
    const filteredList = taskList.filter(item => item.taskId !== taskId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));

    saveTask({ taskId, taskName, taskStatus });
  });
};

const moveTask = (taskId, taskStatus) => {
  const task = document.querySelector(`#${taskId}`);
  const taskContainers = Array.from(document.querySelectorAll('.task-containers'));
  const clonedTask = task.cloneNode(true);
  const clonedTaskId = clonedTask.id;

  const handleMovedTask = (taskContainerNumber) => {
    removeTask(taskId);
    taskContainers[taskContainerNumber].appendChild(clonedTask);

    // Cloned elements do not inherit event listeners, so open their ears
    document.querySelector(`#${clonedTaskId} .marker`).addEventListener('click', () => {
      moveTask(clonedTaskId, taskStatus);
    });

    document.querySelector(`#${clonedTaskId} .edit`).addEventListener('click', () => {
      editTask(clonedTaskId, taskStatus);
    });

    document.querySelector(`#${clonedTaskId} .remove`).addEventListener('click', () => {
      removeTask(clonedTaskId);
    });

    const taskName = document.querySelector(`#${clonedTaskId} span`).innerHTML;
    saveTask({ taskId: clonedTaskId, taskName, taskStatus });
  };

  switch (taskStatus) {
    case TASK_STATUS.TODO:
      taskStatus = TASK_STATUS.DOING;
      handleMovedTask(1);
      break;
    case TASK_STATUS.DOING:
      taskStatus = 'done';
      handleMovedTask(2);
      break;
    default:
      break;
  }
};

const createTask = (taskName, taskId = `task-${new Date().getTime()}`, taskStatus = TASK_STATUS.TODO) => {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.setAttribute('id', taskId);

  const marker = document.createElement('button');
  marker.classList.add('marker');
  marker.innerText = '✓';
  marker.addEventListener('click', () => {
    moveTask(taskId, taskStatus);
  });

  const span = document.createElement('span');
  span.setAttribute('spellcheck', 'false');
  span.innerHTML = taskName;

  const edit = document.createElement('button');
  edit.classList.add('edit');
  edit.innerText = '✎';
  edit.addEventListener('click', () => {
    editTask(taskId, taskStatus);
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
  const taskContainers = Array.from(document.querySelectorAll('.task-containers'));
  const taskContainer0 = taskContainers[0];

  switch (taskStatus) {
    case TASK_STATUS.TODO:
      taskContainer0.appendChild(taskElement);
      break;
    case TASK_STATUS.DOING:
      taskContainers[1].appendChild(taskElement);
      break;
    default:
      taskContainers[2].appendChild(taskElement);
      break;
  }

  countTasks(taskContainer0);
  return { taskId, taskStatus };
};

const fetchTasks = () => {
  let taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) {
    taskStr = JSON.parse(taskStr);
    // Sort to avoid edited tasks appearing at the bottom due to queing effect of local storage
    return taskStr.sort((a, b) => a.taskId > b.taskId);
  }

  return [];
};

export {
  saveTask, createTask, addTaskToDOM, fetchTasks
};
