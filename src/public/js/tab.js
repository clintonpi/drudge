import countTasks from './count';

const activateTabs = () => {
  const switchTabs = (tabNumber) => {
    const taskContainers = Array.from(document.querySelectorAll('.task-containers'));

    taskContainers.forEach((taskContainer) => {
      const taskContainerStyle = taskContainer.style;

      if (taskContainers.indexOf(taskContainer) === tabNumber) {
        const formStyle = document.querySelector('#form').style;
        taskContainerStyle.display = 'block';

        if (taskContainer === taskContainers[0]) {
          formStyle.visibility = 'visible';
          formStyle.opacity = 1;
        } else {
          formStyle.visibility = 'hidden';
          formStyle.opacity = 0;
        }

        countTasks(taskContainer);
        return;
      }

      taskContainerStyle.display = 'none';
    });
  };

  (() => {
    const tabBtns = Array.from(document.querySelectorAll('.tab-btns'));

    tabBtns.forEach((tabBtn) => {
      tabBtn.addEventListener('click', (e) => {
        switchTabs(tabBtns.indexOf(tabBtn));

        tabBtns.forEach((btn) => {
          const btnStyle = btn.style;

          if (e.target === tabBtns[tabBtns.indexOf(btn)]) {
            btnStyle.backgroundColor = '#1abc9c';
            btnStyle.color = '#ffffff';
            return;
          }

          btnStyle.backgroundColor = '#ffffff';
          btnStyle.color = '#1abc9c';
        });
      });
    });
  })();
};

export default activateTabs;
