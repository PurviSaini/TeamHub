// Check if the user is already logged in
fetch("/checkAuth")
  .then((response) => response.json())
  .then((data) => {
    if (data.loggedIn) {
      document.getElementById("logoutBtn").style.display = "block";
    } else {
      document.getElementById("logoutBtn").style.display = "none";
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
document
  .getElementById("logoutBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    // Send logout request to the server
    fetch("/logout")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Logged out successfully!");
          window.location.href = "/";
        } else {
          alert("Logout failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

document.getElementById("userEmail").textContent =
  localStorage.getItem("email");

//create team with a code
document
  .getElementById("createTeam")
  .addEventListener("click", function (event) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters.charAt(randomIndex);
      result += randomCharacter;
    }
    document.getElementById("teamCode").textContent = result;
  });

//join team
document.getElementById("joinBtn").addEventListener("click", function (event) {
  console.log("join btn clicked");
  event.preventDefault();
  const teamCode = document.getElementById("joinTeamCode").value;
  const memberEmail = localStorage.getItem("email");
  console.log("team code", teamCode);
  console.log(" email", memberEmail);

  fetch("/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ teamCode, memberEmail }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("You have joined the Team");
        window.location.href = "/team";
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log("Error in joining team : ", error);
    });
});
