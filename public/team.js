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

//get tasks from database
//task
const showTasks = async (event) => {
    try {
      const response = await fetch("/getTasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const existingTasks = await response.json();
        existingTasks.forEach((individualTask) => {
          displayTask(individualTask);
        });
        taskForm.reset();
      } else {
        throw new Error("Failed to create task.");
      }
    } catch (error) {
      console.error(error);
    }
  };
  //ADD NEW TASKS
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  
  // Function to create a new task
  const createTask = async (event) => {
    event.preventDefault();
  
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("dueDate").value;
    const assignedTo = document.getElementById("assignedTo").value;
    const priority = document.getElementById("priority").value;
  
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          assignedTo,
          priority,
          status: "to-do",
        }),
      });
  
      if (response.ok) {
        const newTask = await response.json();
        displayTask(newTask);
        taskForm.reset();
      } else {
        throw new Error("Failed to create task.");
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // Function to display a new task in the list
  const displayTask = (task) => {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item container my-3  p-3 border border-primary border-3 rounded";
    taskItem.style.boxShadow="5px 10px 8px 10px #888888";
    taskItem.style.backgroundImage="url(/public/img/4.png)";

    const taskTitle = document.createElement("h2");
    taskTitle.className="text-center bold-text"
    taskTitle.textContent = task["tasks"][0].title;
    taskItem.appendChild(taskTitle);
  
    const taskDescription = document.createElement("p");
    taskDescription.className="p-2 text-center "
    taskDescription.style.backgroundImage="url(/public/img/blue_bg.png)"
    taskDescription.style.backgroundPosition="right";
    taskDescription.textContent = task["tasks"][0].description;
    taskItem.appendChild(taskDescription);
  
    const taskDueDate = document.createElement("p");
    taskDueDate.textContent = `Due Date: ${task["tasks"][0].dueDate}`;
    taskItem.appendChild(taskDueDate);
  
    const taskAssignedTo = document.createElement("p");
    taskAssignedTo.textContent = `Assigned To: ${task["tasks"][0].assignedTo}`;
    taskItem.appendChild(taskAssignedTo);
  
    const taskPriority = document.createElement("p");
    taskPriority.textContent = `Priority: ${task["tasks"][0].priority}`;
    taskItem.appendChild(taskPriority);
  
    const taskStatus = document.createElement("select");
    taskStatus.innerHTML = `
    <option value="to-do">To Do</option>
    <option value="in-progress">In Progress</option>
    <option value="completed">Complete</option>
  `;
  taskStatus.className="border border-primary p-2 status";
    taskItem.appendChild(taskStatus);
  
    const deleteButton = document.createElement("button");
    deleteButton.className="btn btn-primary my-2 d-block";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteTask(task._id); // Call the deleteTask function passing the task ID
      taskList.removeChild(taskItem); // Remove the task item from the DOM
    });
    taskItem.appendChild(deleteButton);
  
    taskList.appendChild(taskItem);
  };
  
  // Event listener for form submission
  taskForm.addEventListener("submit", createTask);
  showTasks();
  
  //DELETE
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }
    } catch (error) {
      console.error(error);
    }
  };

//team docs
  const showDocs = async (event) => {
    try {
      const response = await fetch("/getDocs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const existingDocs = await response.json();
        existingDocs.forEach((individualDoc) => {
          displayDoc(individualDoc);
        });
        docForm.reset();
      } else {
        throw new Error("Failed to create doc.");
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  //add new docs
  const docForm = document.getElementById("docForm");
  const docList = document.getElementById("docList");
  
  // Function to create a new doc
  const createDocs = async (event) => {
    event.preventDefault();
  
    const title = document.getElementById("docTitle").value;
    const description = document.getElementById("docDescription").value;
  console.log(title,description)
    try {
      const response = await fetch("/newDoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description
        }),
      });
  
      if (response.ok) {
        const newDoc = await response.json();
        displayDoc(newDoc);
        docForm.reset();
      } else {
        throw new Error("Failed to create doc.");
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // Function to display a new doc in the list
  const displayDoc = (doc) => {
    const docItem = document.createElement("div");
    docItem.className = "doc-item";
    docItem.className = "doc-item container my-3  p-3 border border-primary border-3 rounded";
    docItem.style.boxShadow="5px 10px 8px 10px #888888";
    docItem.style.backgroundImage="url(/public/img/4.png)";


    const docTitle = document.createElement("h2");
    docTitle.textContent = doc["docs"][0].title;
    docTitle.className="text-center bold-text"
    docItem.appendChild(docTitle);
  
    const docDescription = document.createElement("p");
    docDescription.className="p-2 text-center"
    docDescription.style.backgroundImage="url(/public/img/blue_bg.png)"
    docDescription.style.backgroundPosition="right";
    docDescription.textContent = doc["docs"][0].description;
    docItem.appendChild(docDescription);
  
    const deleteButton = document.createElement("button");
    deleteButton.className="btn btn-primary my-2 d-block";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteDoc(doc._id); // Call the deleteDoc function passing the doc ID
      docList.removeChild(docItem); // Remove the doc item from the DOM
    });
    docItem.appendChild(deleteButton);
  
    docList.appendChild(docItem);
  };
  
  // Event listener for form submission
  docForm.addEventListener("submit", createDocs);
  showDocs();
  
  //DELETE
  const deleteDoc = async (docId) => {
    try {
      const response = await fetch(`/docs/${docId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete doc.");
      }
    } catch (error) {
      console.error(error);
    }
  };