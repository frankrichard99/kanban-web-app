import {
  statusPrompt,
  refreshAccessToken,
  showLoading,
  hideLoading,
  renderAccountName,
  getAccountInfo
} from "./utility.js";
const statusOutput = document.querySelector("#status-output");

const updateTaskOverlay = document.querySelector(".modal-overlay");
const closeUpdateModalBtn = document.querySelector(".close-update-popup-btn");
const updateTaskForm = document.querySelector(".modal-form");

function showUpdateModal() {
  updateTaskOverlay.classList.add("show");
}

function hideUpdateModal() {
  updateTaskOverlay.classList.remove("show");
}

closeUpdateModalBtn.addEventListener("click", hideUpdateModal);

window.addEventListener("click", (e) => {
  if (e.target === updateTaskOverlay) {
    hideUpdateModal();
  }
});

// Handle update form submission

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

  const formData = new FormData(updateTaskForm);
  const title = formData.get("task-title");
  const description = formData.get("task-description");
  const status = formData.get("task-status");
  const taskId = formData.get("task-id");

  const taskData = {
    title,
    description,
    status,
    taskId,
  };

  console.log(taskData);
  // Show the loading sign BEFORE the request
  showLoading();
  try {
    const response = await sendUpdateRequest(taskData);

    if (response.status === 403) {
      console.log("Access token has expired, refreshing...");
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
    hideUpdateModal();
    updateTaskForm.reset();
  }
};

updateTaskForm.addEventListener("submit", handleTaskUpdate);

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

const deleteTaskForm = document.querySelector("#deleteForm");
const deleteModalOverlay = document.querySelector(".delete-modal-overlay");
const closeDeleteModalBtn = document.querySelector(".close-delete-modal-btn");
const cancelBtn = document.querySelector(".cancel-delete-btn");
const confirmBtn = document.querySelector(".confirm-delete-btn");

// Function to show the modal
function showDeleteModal() {
  deleteModalOverlay.classList.add("show");
}

// Function to hide the modal
function hideDeleteModal() {
  deleteModalOverlay.classList.remove("show");
}

// Event listeners to close the modal
closeDeleteModalBtn.addEventListener("click", hideDeleteModal);
cancelBtn.addEventListener("click", hideDeleteModal);

// Event listener to handle clicking outside the modal
window.addEventListener("click", (e) => {
  if (e.target === deleteModalOverlay) {
    hideDeleteModal();
  }
});

// Handle delete form submission

const sendDeleteRequest = async (data) => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch(
    `http://localhost:3000/api/tasks/${data.taskId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );
  return response;
};

const handleTaskDelete = async (e) => {
  e.preventDefault();

  const formData = new FormData(deleteTaskForm);
  const taskId = formData.get("delete-task-id");

  const taskData = {
    taskId,
  };
  showLoading();

  try {
    const response = await sendDeleteRequest(taskData);

    if (response.status === 403) {
      console.log("Access token expired, refreshing...");
      await refreshAccessToken();
      response = await sendDeleteRequest(taskData);
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
    hideDeleteModal();
    deleteTaskForm.reset();
  }
};

deleteTaskForm.addEventListener("submit", handleTaskDelete);

function renderHTML(taskData) {
  document.querySelector(".task-list").innerHTML = "";
  let html = `<div class="task-row">
    <label>Title</label>
    <label>Description</label>
    <label>Status</label>

  </div>`;
  taskData.forEach(({ _id, title, description, status }) => {
    if(description == ""){
      description = "No description"
    }
    const div = `
    <div class="task-row">
            <span class="task-title">${title}</span>
            <span class="task-description">${description}</span>
            <span id="task-id" style="display: none;">${_id}</span>
            <span class="task-status">${status}</span>
            <div class="task-actions">
              <button class="delete-btn delete-task-btn">❌</button>
              <button class="edit-btn update-task-btn">✏️</button>
            </div>
          </div>`;
    html += div;
  });
  document.querySelector(".task-list").innerHTML = html;

  let updateTaskBtns = Array.from(
    document.querySelectorAll(".update-task-btn")
  );

  updateTaskBtns.forEach((btn, i) => {
    btn.addEventListener("click", (event) => {
      const parentDiv = event.target.closest(".task-row");
      const title = parentDiv.querySelector(".task-title").textContent;
      const description =
        parentDiv.querySelector(".task-description").textContent;
      const taskId = parentDiv.querySelector("#task-id").textContent;
      const status = parentDiv.querySelector(".task-status").textContent;

      // Populate the form fields correctly
      updateTaskForm.querySelector("#task-title").value = title;

      updateTaskForm.querySelector("#task-description").value = description;

      updateTaskForm.querySelector("#task-id").value = taskId;
      updateTaskForm.querySelector("#task-status").value = status;

      showUpdateModal();
    });
  });

  let deleteTaskBtns = Array.from(
    document.querySelectorAll(".delete-task-btn")
  );

  deleteTaskBtns.forEach((btn, i) => {
    btn.addEventListener("click", (event) => {
      const parentDiv = event.target.closest(".task-row");
      const taskId = parentDiv.querySelector("#task-id").textContent;

      deleteTaskForm.querySelector("#delete-task-id").value = taskId;

      showDeleteModal();
      console.log(taskId);
    });
  });
}
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
  } catch (error) {
    statusPrompt(statusOutput, "Unexpected error occured", 404);
    console.error(error);
  } finally {
    hideLoading();
  }
};

const handlePageLoad = async () => {
  showLoading();
try{
    await handleTasksDisplay();
  await getAccountInfo();
}
catch(err){
   statusPrompt(statusOutput, "Couldn't load page", 404);
    console.error(err);
}finally{
  hideLoading();
}
}
document.addEventListener("DOMContentLoaded", handlePageLoad);
