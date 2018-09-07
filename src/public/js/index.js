import { saveTask, addTaskToDOM, fetchTasks } from './tasks';
import sanitizeStr from './utils';
import '../scss/style.scss';

const form = document.querySelector('#form');

const formHandler = (e) => {
  e.preventDefault();

  let taskName = document.querySelector('#task-name').value;
  taskName = sanitizeStr(taskName);

  if (taskName.length < 1) return;

  const { taskId, taskStatus } = addTaskToDOM(taskName);
  saveTask({ taskId, taskName, taskStatus });

  form.reset();
};

(() => {
  const taskList = fetchTasks();

  if (taskList.length < 1) return;

  taskList
    .forEach(({ taskId, taskName, taskStatus }) => addTaskToDOM(taskName, taskId, taskStatus));
})();

form.addEventListener('submit', formHandler);
