import { createTask, saveTask, fetchTasks } from './tasks';
import activateTabs from './tab';
import countTasks from './count';
import '../scss/style.scss';

const form = document.querySelector('#form');

const addTask = (taskName, id) => {
  const { taskId, taskElement } = createTask(taskName, id);
  const splittedTaskId = taskId.split('-');
  const taskContainers = Array.from(document.querySelectorAll('.task-containers'));
  const taskContainer0 = taskContainers[0];

  if (splittedTaskId.indexOf('todo') !== -1) {
    taskContainer0.appendChild(taskElement);
  } else if (splittedTaskId.indexOf('doing') !== -1) {
    taskContainers[1].appendChild(taskElement);
  } else {
    taskContainers[2].appendChild(taskElement);
  }

  countTasks(taskContainer0);
  form.reset();
  return taskId;
};

const formHandler = (e) => {
  e.preventDefault();

  const taskName = document.querySelector('#task-name').value;

  if (taskName.length < 1) return;

  const taskId = addTask(taskName);
  saveTask({ taskId, taskName });
};

(() => {
  const taskList = fetchTasks();

  activateTabs();

  if (taskList.length < 1) return;

  taskList.forEach(({ taskId, taskName }) => addTask(taskName, taskId));
})();

form.addEventListener('submit', formHandler);
