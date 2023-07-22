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

//toggle sections
let toggleBtn = document.querySelectorAll(".btn-toggle");
toggleBtn.forEach((btn) => {
  btn.addEventListener("click", function (event) {
    document.querySelectorAll("main").forEach((section) => {
      section.style.display = "none";
    });
    document.getElementById(`section-${btn.id}`).style.display = "block";
  });
});
