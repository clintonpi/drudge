import { saveTask, addTaskToDOM, fetchTasks } from './tasks';
import activateTabs from './tab';
import '../scss/style.scss';

const form = document.querySelector('#form');

const formHandler = (e) => {
  e.preventDefault();

  const taskName = document.querySelector('#task-name').value;

  if (taskName.length < 1) return;

  const { taskId, taskStatus } = addTaskToDOM(taskName);
  saveTask({ taskId, taskName, taskStatus });

  form.reset();
};

(() => {
  const taskList = fetchTasks();

  activateTabs();

  if (taskList.length < 1) return;

  taskList
    .forEach(({ taskId, taskName, taskStatus }) => addTaskToDOM(taskName, taskId, taskStatus));
})();

form.addEventListener('submit', formHandler);
