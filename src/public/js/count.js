const countTasks = (taskContainer) => {
  const elementCount = taskContainer.childElementCount;
  const taskCount = elementCount === 0 ? 'no' : elementCount;

  (() => {
    const stackStyle = document.querySelector('#stack').style;
    if (taskCount > 1) {
      stackStyle.display = 'block';
    } else {
      stackStyle.display = 'none';
    }
  })();

  (() => {
    const taskContainers = Array.from(document.querySelectorAll('.task-containers'));
    const taskInfo = document.querySelector('#task-info');
    const task = taskCount > 1 ? 'tasks' : 'task';
    if (taskContainer === taskContainers[0]) {
      taskInfo.innerText = `You have ${taskCount} ${task} to do.`;
    } else if (taskContainer === taskContainers[1]) {
      taskInfo.innerText = `You have been doing ${taskCount} ${task}.`;
    } else if (taskContainer === taskContainers[2]) {
      taskInfo.innerText = `You have done ${taskCount} ${task}.`;
    }
  })();
};

export default countTasks;
