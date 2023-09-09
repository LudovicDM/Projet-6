const loginBtn = document.querySelector(".login_btn");

function login() {
    const error = document.querySelector(".error");

    let login = {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({
            email: inputs[0].value,
            password: inputs[1].value,
        }),
    };

    fetch("http://localhost:5678/api/users/login", login)
        .then((rep) => rep.json())
        .then((data) => {
            let token = data.token;
            localStorage.setItem("Token", token);
            if (token) {
                window.location.href = "./index.html";
            } else {
                error.style.visibility = "visible";
            }
        });
}

loginBtn.addEventListener("click", login);

const inputs = document.querySelectorAll("input");
inputs.forEach((input) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            loginRequest();
        }
    });
});
