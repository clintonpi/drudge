import {
  saveTask, fetchTasks, removeCompletedTasks, countTasks, addTaskToDOM
} from './tasks';
import sanitizeStr from './utils';
import '../index.html';
import '../scss/style.scss';
import '../images/drudge-logo.svg';

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
  countTasks();

  const taskList = fetchTasks();

  if (taskList.length < 1) return;

  taskList
    .forEach(({ taskId, taskName, taskStatus }) => addTaskToDOM(taskName, taskId, taskStatus));
})();

document.querySelector('#info-wrap button').addEventListener('click', removeCompletedTasks);
form.addEventListener('submit', formHandler);
