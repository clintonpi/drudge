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

const moveTask = (taskId) => {
  let newId = taskId.split('-');
  const reusedName = document.querySelector(`#${taskId} span`).innerHTML;
  const task = document.querySelector(`#${taskId}`);

  const handleTask = (taskContainerNumber) => {
    removeTask(taskId);

    const clonedTask = task.cloneNode(true);
    newId = newId.join('-');
    clonedTask.id = newId;

    const taskContainers = Array.from(document.querySelectorAll('.task-containers'));
    taskContainers[taskContainerNumber].appendChild(clonedTask);

    // Cloned elements do not inherit event listeners, so open their ears
    document.querySelector(`#${newId} .marker`).addEventListener('click', () => {
      moveTask(newId);
    });

    document.querySelector(`#${newId} .remove`).addEventListener('click', () => {
      removeTask(newId);
    });

    saveTask({ taskId: newId, taskName: reusedName });
  };

  if (taskId.indexOf('todo') !== -1) {
    newId.splice(newId.indexOf('todo'), 1, 'doing');
    handleTask(1);
  } else if (taskId.indexOf('doing') !== -1) {
    newId.splice(newId.indexOf('doing'), 1, 'done');
    handleTask(2);
  }
};

const createTask = (taskName, taskId = `task-${new Date().getTime()}-todo`) => {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.setAttribute('id', taskId);

  const marker = document.createElement('button');
  marker.classList.add('marker');
  marker.innerText = '✓';
  marker.addEventListener('click', () => {
    moveTask(taskId);
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

  return { taskId, taskElement };
};

const fetchTasks = () => {
  const taskStr = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (taskStr) return JSON.parse(taskStr);

  return [];
};

export { saveTask, createTask, fetchTasks };
