document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("passwordConfirm");

  const errorMessageDisplay = document.querySelector(".form-message-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessageDisplay.textContent = "";

    if (confirmPassword.value !== password.value) {
      errorMessageDisplay.textContent = "Passwords do not match.";
      return;
    }

    const formdata = {
      username: username.value.trim(),
      password: password.value,
    };
    console.log(formdata);
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      if (!response.ok) {
        const errorData = await response.json();
        errorMessageDisplay.textContent =
          errorData.message || "Registration failed";

        return;
      }

      const data = await response.json();
      console.log(data);

      setTimeout(() => {
        window.location.href = "login.html";
      }, 500);
    } catch (err) {
      errorMessageDisplay.textContent =
        "An unexpected error occurred. Please try again later.";
      console.error(err);
    }
  });
});
