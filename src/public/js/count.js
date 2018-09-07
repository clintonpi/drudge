const countTasks = () => {
  const taskContainer = document.querySelector('#task-container');
  const stackStyle = document.querySelector('#stack').style;

  if (taskContainer.childElementCount > 1) {
    stackStyle.display = 'block';
    return;
  }

  stackStyle.display = 'none';
};

export default countTasks;
