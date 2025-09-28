const form = document.getElementById("task-form");
const input = document.getElementById("task-input");

const lists = {
  todo: document.getElementById("todo-list"),
  "in-progress": document.getElementById("in-progress-list"),
  done: document.getElementById("done-list"),
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  // wyczyść wszystkie listy
  Object.values(lists).forEach(list => (list.innerHTML = ""));

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.text;

    if (task.status === "done") li.classList.add("done");

    // przyciski w zależności od statusu
    if (task.status === "todo") {
      const progressBtn = document.createElement("button");
      progressBtn.textContent = "➡️";
      progressBtn.title = "Przenieś do W trakcie";
      progressBtn.onclick = () => changeStatus(task.id, "in-progress");
      li.appendChild(progressBtn);
    }

    if (task.status === "in-progress") {
      const backBtn = document.createElement("button");
      backBtn.textContent = "⬅️";
      backBtn.title = "Przenieś do Do zrobienia";
      backBtn.onclick = () => changeStatus(task.id, "todo");
      li.appendChild(backBtn);

      const doneBtn = document.createElement("button");
      doneBtn.textContent = "✔";
      doneBtn.title = "Oznacz jako zrobione";
      doneBtn.onclick = () => markAsDone(task.id);
      li.appendChild(doneBtn);
    }

    if (task.status === "done") {
      li.classList.add("done");
    }

    // przycisk usuwania (dostępny zawsze)
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.title = "Usuń";
    delBtn.onclick = () => deleteTask(task.id);
    li.appendChild(delBtn);

    lists[task.status].appendChild(li);
  });
}

function addTask(text) {
  if (!text.trim()) return; // nie dodawaj pustych
  const newTask = {
    id: Date.now(),
    text,
    status: "todo", // zawsze trafia do "Do zrobienia"
    createdAt: Date.now(),
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

function changeStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    if (newStatus === "done") {
      task.doneAt = Date.now();
    }
    saveTasks();
    renderTasks();
  }
}

function markAsDone(id) {
  changeStatus(id, "done");
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function autoRemoveOldDoneTasks() {
  const now = Date.now();
  tasks = tasks.filter(
    t => !(t.status === "done" && now - t.doneAt > 24 * 60 * 60 * 1000)
  );
  saveTasks();
  renderTasks();
}

// obsługa formularza
form.addEventListener("submit", e => {
  e.preventDefault();
  addTask(input.value);
  input.value = "";
});

// inicjalizacja
autoRemoveOldDoneTasks();
renderTasks();
setInterval(autoRemoveOldDoneTasks, 60 * 60 * 1000); // sprawdzaj co godzinę
