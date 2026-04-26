

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorOuput = document.getElementsByClassName("form-message-error");


    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;


        const formdata = {
            username,
            password
        }


        try{
            
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(formdata)
        })
    
        if(!response.ok){
            const errorData = await response.json();
            errorOuput.textContent = errorData.message || "Login Failed.";
            return
        }
        if(response.status === 401){
            const errorData = await response.json();

            errorOuput.textContent = errorData.message;
        }
            const {message, data} = await response.json();
            errorOuput.textContent = message;

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            setTimeout(() => {
                window.location.href = "index.html"
            }, 500);

        }
        catch(err){
            errorOuput.textContent = "Unexpected error occured";
            console.error(err);
         
        }
    })


})  