import { LOCAL_STORAGE_KEY } from '../../../constants';
import countTasks from './count';

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

    document.querySelector(`#${clonedTaskId} .remove`).addEventListener('click', () => {
      removeTask(clonedTaskId);
    });

    const taskName = document.querySelector(`#${clonedTaskId} span`).innerHTML;
    saveTask({ taskId: clonedTaskId, taskName, taskStatus });
  };

  switch (taskStatus) {
    case 'todo':
      taskStatus = 'doing';
      handleMovedTask(1);
      break;
    case 'doing':
      taskStatus = 'done';
      handleMovedTask(2);
      break;
    default:
      break;
  }
};

const createTask = (taskName, taskId = `task-${new Date().getTime()}`, taskStatus = 'todo') => {
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
  span.innerHTML = taskName;

  const remove = document.createElement('button');
  remove.classList.add('remove');
  remove.innerText = '✕';
  remove.addEventListener('click', () => {
    removeTask(taskId);
  });

  taskElement.appendChild(marker);
  taskElement.appendChild(span);
  taskElement.appendChild(remove);

  return { taskId, taskElement, taskStatus };
};

const addTaskToDOM = (taskName, id, status) => {
  const { taskId, taskElement, taskStatus } = createTask(taskName, id, status);
  const taskContainers = Array.from(document.querySelectorAll('.task-containers'));
  const taskContainer0 = taskContainers[0];

  switch (taskStatus) {
    case 'todo':
      taskContainer0.appendChild(taskElement);
      break;
    case 'doing':
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
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) return JSON.parse(taskStr);

  return [];
};

export {
  saveTask, createTask, addTaskToDOM, fetchTasks
};
