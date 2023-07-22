document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Login successful!");
          localStorage.setItem("email", email);

          // Check if the user's email is part of a team
          fetch("/checkTeamMembership", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.isMember) {
                // If the user is already part of a team, redirect to /team route
                window.location.href = "/team";
              } else {
                // If the user is not part of a team, redirect to /main route
                window.location.href = "/main";
              }
            })
            .catch((error) => {
              console.error("Error checking team membership:", error);
              alert("Error checking team membership.");
            });
        } else {
          alert("Login failed. Please check your credentials.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
