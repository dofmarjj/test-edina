// logic of setting focus on donate-btn after donate-modal window close
const enterKey = "Enter";
const escapeKey = "Escape";
const spaceKey = " ";
let saveBtnFocus = null;
const donateModal = document.querySelector("#donate-modal");

function setFocusBackOnButton() {
  setTimeout(() => {
    // check if donate-modal window is closed
    if (!donateModal.classList.contains("show")) {
      saveBtnFocus.focus();
    }
  }, 100);
}

// save el for setting focus here after donate-modal window close
document.querySelectorAll(".support-project-button").forEach((el) => {
  el.addEventListener("keydown", (event) => {
    if (event.key === enterKey) {
      saveBtnFocus = document.activeElement;
    }
  });
});

if (donateModal) {
  donateModal.addEventListener("keydown", (event) => {
    if (
      event.key === enterKey ||
      event.key === escapeKey ||
      event.key === spaceKey
    ) {
      setFocusBackOnButton();
    }
  });
}
