
const accountBtn = document.getElementById("account-btn");
const accountDropDown = document.querySelector(".account-drop");
const navDropDownBtn = document.querySelector("#nav-dropdown-btn");
const navDropDown = document.querySelector(".drop");

const displayMatch = document.querySelector(".result #role");
const resourceDiv = document.querySelector(".result #resources");
Array.from(document.querySelectorAll(".result h3")).forEach(
  (element) => (element.style.display = "none")
);

let hideTimeout;

accountBtn.addEventListener("mouseover", () => {
  showAccOptions();
});

accountBtn.addEventListener("mouseout", () => {
  hideAccOptions();
});

accountDropDown.addEventListener("mouseover", () => {
  showAccOptions();
});

accountDropDown.addEventListener("mouseout", () => {
  hideAccOptions();
});

const showAccOptions = () => {
  clearTimeout(hideTimeout);
  accountDropDown.classList.add("show");
};

const hideAccOptions = () => {
  hideTimeout = setTimeout(() => {
    accountDropDown.classList.remove("show");
  }, 200);
};
navDropDownBtn.addEventListener("click", () => {
  toggleNavDropDown();
});

let timeoutId;
let isNavShowing = false;
function toggleNavDropDown() {
  if (!isNavShowing) {
    clearTimeout(timeoutId);
    navDropDown.style.animation = "showUp 0.5s ease";
    navDropDown.classList.add("show");
    isNavShowing = !isNavShowing;
    navDropDownBtn.textContent = "HIDE";
  } else {
    navDropDown.style.animation = "closeUp 0.5s ease";

    timeoutId = setTimeout(() => {
      navDropDown.classList.remove("show");
    }, 500);
    isNavShowing = !isNavShowing;
    navDropDownBtn.textContent = "SHOW";
  }
}

//HOVER EFFECTS
const dropDownLinks = Array.from(document.querySelectorAll(".drop li"));
const leftLinks = Array.from(document.querySelectorAll(".left li"));
const accountLinks = Array.from(document.querySelectorAll(".account-drop li"));

leftLinks.forEach((link, index, array) => {
  link.addEventListener("mouseover", () => {
    clearAll(array);
    link.classList.add("darken");
  });
});
accountLinks.forEach((link, index, array) => {
  link.addEventListener("mouseover", () => {
    clearAll(array);
    link.classList.add("darken");
  });
});

dropDownLinks.forEach((link, index, array) => {
  link.addEventListener("mouseover", () => {
    clearAll(array);
    link.classList.add("darken");
  });
});

const clearAll = (nodeArr) => {
  nodeArr.forEach((link) => link.classList.remove("darken"));
};