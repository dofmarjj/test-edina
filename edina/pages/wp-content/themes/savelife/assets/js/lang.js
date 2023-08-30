jQuery(
  function () {
    const langItems = document.querySelectorAll('.lang-item');

    langItems.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        const date = new Date();
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), 23, 59, 59);
        const expires = `expires=${ nextMonth.toUTCString() }`;

        document.cookie = `selected_lang=${ el.dataset.lang }; ${ expires }; path=/`;

        location.assign(el.attributes.href.value);
      });
    });
  }
);
