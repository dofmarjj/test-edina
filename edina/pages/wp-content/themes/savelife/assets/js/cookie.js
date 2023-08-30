// Accessibility logic for cookie-notice //
// Third-party plugin needs to adding some usability and navigation possibility
let cookieDialog;

function addEventLogic(el) {
  el.addEventListener("click", () => {
    cookieDialog.remove();
  });

  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      el.click();
      cookieDialog.remove();
      document.querySelector(".skip-main").focus();
    }
  });
}

function implementCookieElAccessibility() {
  setTimeout(() => {
    cookieDialog = document.querySelector("#cookie-notice");

    if (!cookieDialog) {
      return;
    }

    const cookieAcceptBtn = document.querySelector("#cn-accept-cookie");
    const cookieCloseBtn = document.querySelector("#cn-close-notice");

    if (document.querySelector("body").classList.contains("cookies-set")) {
      cookieDialog.remove();
    } else {
      cookieDialog.setAttribute("tabindex", "0");
      cookieAcceptBtn.setAttribute("tabindex", "0");
      cookieCloseBtn.setAttribute("tabindex", "0");
      cookieDialog.focus();

      addEventLogic(cookieAcceptBtn);
      addEventLogic(cookieCloseBtn);
    }
  }, 1500);
}

window.addEventListener('load', implementCookieElAccessibility);
