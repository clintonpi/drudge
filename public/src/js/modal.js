(() => {
  const overlay = document.querySelectorAll('.overlay')[0];
  const modalWrap = document.querySelector('#modal-wrap');
  const deleteModal = document.querySelector('#delete-modal');
  const updateModal = document.querySelector('#update-modal');

  const toggleClass = (element, classToAdd, classToRemove) => {
    element.classList.add(classToAdd);
    element.classList.remove(classToRemove);
  };

  const makeVisible = (...elements) => {
    elements.forEach((element) => {
      toggleClass(element, 'visible', 'hidden');
    });
  };

  const makeHidden = (...elements) => {
    elements.forEach((element) => {
      toggleClass(element, 'hidden', 'visible');
    });
  };

  const show = (element) => {
    toggleClass(element, 'block', 'none');
  };

  const hide = (element) => {
    toggleClass(element, 'none', 'block');
  };

  document.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      makeVisible(overlay, modalWrap);

      if (e.target.id === 'delete-btn') {
        show(deleteModal);
      } else {
        show(updateModal);
      }
    });
  });

  const modals = document.querySelectorAll('.modal');
  const forms = Array.from(document.forms);
  const updateForm = forms[0];
  const changePasswordToggle = document.querySelector('#change-password-toggle');

  document.querySelectorAll('.close').forEach((btn) => {
    btn.addEventListener('click', () => {
      makeHidden(overlay, modalWrap);

      modals.forEach((modal) => {
        hide(modal);
      });

      forms.forEach((form) => {
        if (changePasswordToggle.checked) {
          updateForm.removeChild(document.querySelector('input[name="password"'));
          updateForm.removeChild(document.querySelector('input[name="password2"'));
        }
        form.reset();
      });
    });
  });

  const createInputPasswordElement = (name, placeholder) => {
    const inputElement = document.createElement('input');
    inputElement.type = 'password';
    inputElement.name = name;
    inputElement.placeholder = placeholder;
    inputElement.minLength = 8;
    inputElement.maxLength = 4000;
    inputElement.classList.add('spread', 'bar');
    inputElement.required = true;

    return inputElement;
  };

  changePasswordToggle.addEventListener('change', (e) => {
    const passwordInput = createInputPasswordElement('password', 'New password');
    const password2Input = createInputPasswordElement('password2', 'Confirm new password');

    if (e.target.checked) {
      updateForm.insertBefore(passwordInput, updateForm.childNodes[5]);
      updateForm.insertBefore(password2Input, updateForm.childNodes[6]);
    } else {
      updateForm.removeChild(document.querySelector('input[name="password"'));
      updateForm.removeChild(document.querySelector('input[name="password2"'));
    }
  });
})();
