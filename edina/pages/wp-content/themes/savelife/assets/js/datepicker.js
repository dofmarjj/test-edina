jQuery(
  function () {
    if (!document.querySelector(".datepicker")) {
      return;
    }

    const minDate = new Date(2013, 0, 1);
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    const maxDate = new Date(date);
    const setup = {
      ua: {
        locale: "uk-UA",
        months: [
          "Січень",
          "Лютий",
          "Березень",
          "Квітень",
          "Травень",
          "Червень",
          "Липень",
          "Серпень",
          "Вересень",
          "Жовтень",
          "Листопад",
          "Грудень",
        ],
        days: ["НД", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"],
        other: {
          overlayPlaceholder: "4-значний рік",
          overlayButton: "Вибрати рік",
        },
      },
      en: {
        locale: "en-US",
        months: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
        other: {
          overlayPlaceholder: "4-digit year",
          overlayButton: "Select year",
        },
      }
    };

    let curLang;

    if (document.cookie) {
      curLang = document.cookie.split('; ').filter(item => item.indexOf('pll_language') === 0)[0] || '';
      curLang = curLang && curLang.split('=')[1] || "ua";
    } else {
      curLang = "ua";
    }

    const DOMElements = {
      datepickerWrap: document.querySelector(".datepicker-wrap"),
      clearSelectionBtn: document.querySelector(".clear-filter-btn"),
    };

    const showClearSelectionBtn = () => {
      DOMElements.clearSelectionBtn.style.display = "block";
      DOMElements.datepickerWrap.classList.add("date-selected");
    };

    const clearDateSelection = () => {
      DOMElements.clearSelectionBtn.style.display = "none";
      DOMElements.datepickerWrap.classList.remove("date-selected");

      location.href = isByDate
        ? location.href.replace(/\d{4}-\d{2}-\d{2}/, "").replace("#start", "")
        : location.href;
    };

    // check whether filter by date is applied
    const match = location.href.match(/\d{4}-\d{2}-\d{2}/);
    const isByDate = match && Boolean(match[0] || false);

    let dt, parts;

    if (isByDate) {
      const [year, month, day] = match[0].split("-");
      dt = new Date(year, month - 1, day);

      showClearSelectionBtn();
    }

    const onSelect = (instance, date) => {
      if (!date) {
        // date is unselected
        clearDateSelection();
      }
      // date is selected
      showClearSelectionBtn();

      const offset = date.getTimezoneOffset();

      const dt = offset < 0
        ? new Date(date.getTime() - offset * 60 * 1000)
        : new Date(date.getTime() + offset * 60 * 1000);

      const newDate = dt.toISOString().split('T')[0];

      if (isByDate) {
        parts = location.pathname.replace(/\d{4}-\d{2}-\d{2}/, newDate)
        parts = parts.split("/");
        parts.splice(parts.indexOf("page"), 2);
      } else {
        parts = location.pathname.split("/");
        // put date to the proper place in url
        parts.splice(parts.indexOf("page"), 2, newDate);
      }
      location.href = location.origin + parts.join("/") + "#start";
    };

    const options = {
      startDay: 1,
      position: "br",
      formatter: (input, date, instance) => {
        input.value = date.toLocaleDateString(setup[curLang].locale);
      },
      customMonths: setup[curLang].months,
      customOverlayMonths: setup[curLang].months,
      customDays: setup[curLang].days,
      minDate,
      maxDate,
      dateSelected: dt || null,
      onSelect,
      ...setup[curLang].other,
    };

    const picker = datepicker(".datepicker", options);

    DOMElements.clearSelectionBtn.addEventListener("click", () => {
      picker.setDate();
      clearDateSelection();
    });
  }
);
