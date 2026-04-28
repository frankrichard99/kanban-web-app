import {
  statusPrompt,
  refreshAccessToken,
  showLoading,
  hideLoading,
  renderAccountName,
  getAccountInfo
} from "./utility.js";
const statusOutput = document.querySelector("#status-output");

const colorCards = () => {
  //todo
  const todoCards = Array.from(document.querySelectorAll("#to-do .task-card"));

  todoCards.forEach((card, i) => {
    if (i % 2 == 0) {
      card.style.backgroundColor = "var(--p-light)";
    } else {
      card.style.backgroundColor = "var(--p-dark)";
    }
  });

  //in progress
  const ongoingCards = Array.from(
    document.querySelectorAll("#in-progress .task-card")
  );

  ongoingCards.forEach((card, i) => {
    if (i % 2 == 0) {
      card.style.backgroundColor = "var(--y-light)";
    } else {
      card.style.backgroundColor = "var(--y-dark)";
    }
  });
  //testing
  const testingCards = Array.from(
    document.querySelectorAll("#testing .task-card")
  );

  testingCards.forEach((card, i) => {
    if (i % 2 == 0) {
      card.style.backgroundColor = "var(--r-light)";
    } else {
      card.style.backgroundColor = "var(--r-dark)";
    }
  });
  //done
  const doneCards = Array.from(document.querySelectorAll("#done .task-card"));

  doneCards.forEach((card, i) => {
    if (i % 2 == 0) {
      card.style.backgroundColor = "var(--g-light)";
    } else {
      card.style.backgroundColor = "var(--g-dark)";
    }
  });
};

const addTaskOverlay = document.querySelector(".modal-overlay");
const addTaskBtn = document.querySelector("#add-task-btn");
const closeAddModalBtn = document.querySelector(".close-add-popup-btn");
const addTaskForm = document.querySelector(".modal-form");

function showAddModal() {
  addTaskOverlay.classList.add("show");
}

function hideAddModal() {
  addTaskOverlay.classList.remove("show");
}

addTaskBtn.addEventListener("click", showAddModal);
closeAddModalBtn.addEventListener("click", hideAddModal);

window.addEventListener("click", (e) => {
  if (e.target === addTaskOverlay) {
    hideAddModal();
  }
});

// Handle form submission

const sendCreateRequest = async (data) => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch("http://localhost:3000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  return response;
};

const handleTaskCreation = async (e) => {
  e.preventDefault();

  const formData = new FormData(addTaskForm);
  const title = formData.get("task-title");
  const description = formData.get("task-description");
  const status = formData.get("task-status");

  const taskData = {
    title,
    description,
    status,
  };

  console.log(taskData);

  try {
    const response = await sendCreateRequest(taskData);

    if (response.status === 403) {
      console.log("Access token expired, refreshing...");
      await refreshAccessToken();
      response = await sendTaskRequest(taskData);
    }

    if (!response.ok) {
      const errorData = await response.json();

      statusPrompt(statusOutput, errorData.message, response.status);

      return;
    }

    const data = await response.json();
    statusPrompt(statusOutput, data.message, response.status);
    await handleTasksDisplay();
  } catch (error) {
    statusPrompt(statusOutput, "Unexpected error occured", 404);
    console.error(error);
  } finally {
    hideAddModal();
    addTaskForm.reset();
  }
};

addTaskForm.addEventListener("submit", handleTaskCreation);

const getTasks = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch("http://localhost:3000/api/tasks", {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response;
};

const handleTasksDisplay = async () => {
  showLoading();
  try {
    const response = await getTasks();

    if (response.status === 403) {
      await refreshAccessToken();

      const response = await getTasks();
    }
    if (!response.ok) {
      const errorData = await response.json();
      statusPrompt(statusOutput, errorData.message, response.status);
      return;
    }

    const { data } = await response.json();
    renderHTML(data);
    colorCards();
  } catch (error) {
    statusPrompt(statusOutput, "Unexpected error occured", 404);
    console.error(error);
  } finally {
    hideLoading();
  }
};

const updateTaskForm = document.getElementById("updateForm");

const sendUpdateRequest = async (data) => {
  console.log(data);
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch(
    `http://localhost:3000/api/tasks/${data.taskId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );
  return response;
};

const handleTaskUpdate = async (e) => {
  e.preventDefault();

  // Get the values from the form inputs directly by their IDs
  // This is a more reliable way to get form data without relying on FormData.
  const title = updateForm.querySelector(".task-title").value;
  const description = updateForm.querySelector(".task-description").value;
  const status = document.querySelector("#toStatus").textContent;
  const taskId = document.querySelector("#taskId").textContent;

  // Construct the taskData object with the collected values
  const taskData = {
    title,
    description,
    status,
    taskId,
  };

  console.log(taskData);
  // Show loading sign BEFORE the request
  showLoading();
  try {
    let response = await sendUpdateRequest(taskData);

    if (response.status === 403) {
      console.log("Access token expired, refreshing...");
      await refreshAccessToken();
      response = await sendUpdateRequest(taskData);
    }

    if (!response.ok) {
      const errorData = await response.json();
      statusPrompt(statusOutput, errorData.message, response.status);
      return;
    }

    const data = await response.json();
    statusPrompt(statusOutput, data.message, response.status);
    await handleTasksDisplay();
  } catch (error) {
    statusPrompt(statusOutput, "Unexpected error occured", 404);
    console.error(error);
  } finally {
    hideLoading();
    closeUpdateModal();
    updateTaskForm.reset();
  }
};

updateTaskForm.addEventListener("submit", handleTaskUpdate);

// Get modal elements
const modalOverlay = document.getElementById("update-modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const yesBtn = document.getElementById("yesBtn");
const cancelBtn = document.getElementById("cancelBtn");

const openUpdateModal = (
  fromStatus,
  toStatus,
  task_id,
  task_title,
  task_description
) => {
  const fromStatusEl = document.getElementById("fromStatus");
  const toStatusEl = document.getElementById("toStatus");
  const taskIdEl = document.getElementById("taskId");

  modalOverlay.querySelector(".task-title").value = task_title;
  modalOverlay.querySelector(".task-description").value = task_description;
  fromStatusEl.textContent = fromStatus;
  toStatusEl.textContent = toStatus;
  taskIdEl.textContent = task_id;

  modalOverlay.style.display = "flex";

  setTimeout(() => {
    modalOverlay.querySelector(".update-modal-content").classList.add("show");
  }, 10);
};

export const closeUpdateModal = () => {
  modalOverlay.querySelector(".update-modal-content").classList.remove("show");
  setTimeout(() => {
    modalOverlay.style.display = "none";
  }, 200);
};

closeModalBtn.addEventListener("click", closeUpdateModal);
cancelBtn.addEventListener("click", closeUpdateModal);

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeUpdateModal();
  }
});

export const renderHTML = (tasks) => {
  document.getElementById("to-do-body").innerHTML = "";
  document.getElementById("in-progress-body").innerHTML = "";
  document.getElementById("testing-body").innerHTML = "";
  document.getElementById("done-body").innerHTML = "";

  tasks.forEach(({ _id, title, description, status }) => {
    const div = document.createElement("div");
    div.className = "task-card";
    div.draggable = true;
    div.id = `task-${_id}`;
    const titleParagraph = document.createElement("p");
    titleParagraph.textContent = title;
    div.appendChild(titleParagraph);

    const span = document.createElement("span");
    span.textContent = description;
    span.style.display = "none";
    div.appendChild(span); 

    div.addEventListener("dragstart", (event) => {
      const data = { _id, status, title, description };
      event.dataTransfer.setData("application/json", JSON.stringify(data));
      event.dataTransfer.effectAllowed = "move";
    });

    switch (status) {
      case "todo":
        document.getElementById("to-do-body").appendChild(div);
        break;
      case "ongoing":
        document.getElementById("in-progress-body").appendChild(div);
        break;
      case "testing":
        document.getElementById("testing-body").appendChild(div);
        break;
      case "done":
        document.getElementById("done-body").appendChild(div);
        break;
      default:
        console.error(`${_id} does not have a status`);
    }
  });

  const containers = document.querySelectorAll(".kanban-column-body");

  containers.forEach((container) => {
    container.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    container.addEventListener("drop", (event) => {
      event.preventDefault(); 
      const data = JSON.parse(event.dataTransfer.getData("application/json"));
      const taskId = data._id;
      const prevStatus = data.status;
      const title = data.title;
      const desc = data.description;
      const draggedElement = document.getElementById(`task-${taskId}`);

      if (draggedElement) {
        const statusMap = {
          "to-do-body": "todo",
          "in-progress-body": "ongoing",
          "testing-body": "testing",
          "done-body": "done",
        };
        const newStatus = statusMap[container.id];

        console.log(prevStatus, newStatus, taskId, title, desc);
        openUpdateModal(prevStatus, newStatus, taskId, title, desc);
      }
    });
  });
};
const handlePageLoad = async () => {
  showLoading();
  try {
    await handleTasksDisplay();

    await getAccountInfo();

  } catch (err) {
    statusPrompt(statusOutput, "Page loading failed", 404);
    console.error(err);
    return;
  } finally {
    hideLoading();
  }
};
document.addEventListener("DOMContentLoaded", handlePageLoad);
