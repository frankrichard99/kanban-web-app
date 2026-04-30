export function statusPrompt(element, message, status_code) {
  if (status_code == 200 || status_code == 201) {
    element.textContent = message || "Success";
    element.classList.add("success");
    setTimeout(() => {
      element.classList.remove("success");
    }, 3000);
  } else {
    element.textContent = message || "Failed";
    element.classList.add("failed");
    setTimeout(() => {
      element.classList.remove("failed");
    }, 3000);
  }
}
export const refreshAccessToken = async () => {
  const token = localStorage.getItem("refreshToken");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/refresh/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (response.ok) {
      const { data } = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      alert("Tokens refreshed successfully.", data.accessToken);
    } else {
      // Refresh failed, log the user out
      window.location.href = "login.html";
    }
  } catch (error) {
    // Network error, log the user out
    console.error("Failed to refresh token:", error);
    window.location.href = "login.html";
  }
};

const loadingOverlay = document.querySelector(".loading-overlay");

export function showLoading() {
  loadingOverlay.classList.add("show");
}

export function hideLoading() {
  loadingOverlay.classList.remove("show");
}


export function renderAccountName(name){
  const output = document.querySelector("#account-btn");
  output.textContent = name;
  
}
export 
const getAccountInfo = async () => {
  const token = localStorage.getItem("accessToken");
  showLoading();
  try {
    const response = await fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = response.json();
      return statusPrompt(statusOutput, errorData.message, response.status);
    }

    const data = await response.json();
    const username = data.data['username'];

    renderAccountName(`${username} ◉`);
  } catch (err) {
    statusPrompt(statusOutput, "Couldn't fetch username", 404);
    console.error(err);
    return;
  }
};
