import {
  saveTask, fetchTasks, removeCompletedTasks, countTasks, addTaskToDOM
} from './tasks';
import sanitizeStr from './utils';
import '../index.html';
import '../html/signup.html';
import '../html/login.html';
import '../html/profile.html';
import '../html/404.html';
import '../scss/all.scss';
import '../scss/form.scss';
import '../scss/main.scss';
import '../scss/account.scss';
import '../scss/profile.scss';
import '../scss/404.scss';
import '../images/drudge-logo.svg';
import '../images/twitching-drudge.gif';

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
