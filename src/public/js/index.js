import { saveTask, addTaskToDOM, fetchTasks } from './tasks';
import activateTabs from './tab';
import '../scss/style.scss';

const form = document.querySelector('#form');

const formHandler = (e) => {
  e.preventDefault();

  const taskName = document.querySelector('#task-name').value;

  if (taskName.length < 1) return;

  const taskId = addTaskToDOM(taskName);
  saveTask({ taskId, taskName });

  form.reset();
};

(() => {
  const taskList = fetchTasks();

  activateTabs();

  if (taskList.length < 1) return;

  taskList.forEach(({ taskId, taskName }) => addTaskToDOM(taskName, taskId));
})();

form.addEventListener('submit', formHandler);
