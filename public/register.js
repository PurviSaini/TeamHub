document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    //send registeration request to server
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Registration successful! Please Log in");
          window.location.href = "/";
        } else {
          alert("Registration failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
