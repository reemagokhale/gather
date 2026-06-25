const form =
    document.getElementById("loginForm");

const message =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        message.textContent = "";
        message.classList.add("hidden");

        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const { error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        loginButton.disabled = false;
        loginButton.textContent = "Sign in";

        if (error) {

            message.textContent = error.message;
            message.classList.remove("hidden");

            return;

        }

        window.location.href = "dashboard.html";

    }
);