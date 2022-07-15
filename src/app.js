import "./styles.css";

const todoInput = document.getElementById("todo-input");
const todoForm = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");
const template = document.getElementById("todo-item");
const searchInput = document.getElementById("search-input");

const editText = document.getElementById("edit-text");
const todoBtn = document.getElementById("todo-btn");

const allTodos = [];

/**
 * Format Date to the format Wednesday, 18 December 2019, 02:39
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
 * @param {Date} date
 * @returns {String} A date in the format Wednesday, 18 December 2019, 02:39
 */
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(date).toLocaleString("en-us", options);
}

function addTodo(...todos) {
  const list = document.createDocumentFragment();

  todos.forEach((todo) => {
    /** @type {HTMLElement} */
    const clone = document.importNode(template.content, true);
    const listItem = clone.querySelector("li");
    const todoText = clone.querySelector("p");
    const todoTime = clone.querySelector(".text-muted");
    const todoEditBtn = clone.querySelector(".edit-btn");
    const todoDeleteBtn = clone.querySelector(".delete-btn");

    // data-todo-id attribute
    listItem.dataset.todoId = todo.id;

    todoText.textContent = todo.text;
    todoTime.textContent = formatDate(todo.created);

    todoEditBtn.addEventListener("click", editTodo.bind(null, todo.id));
    todoDeleteBtn.addEventListener("click", deleteTodo.bind(null, todo.id));

    list.appendChild(clone);
  });

  todoList.append(list);
}

function editTodo(todoId) {
  const listItem = document.querySelector(`[data-todo-id="${todoId}"]`);
  const todoText = listItem.querySelector("p").textContent;

  editText.textContent = `Editing Todo: ${todoText}`;
  todoBtn.textContent = "Save Todo";
  todoInput.value = todoText;
  todoForm.dataset.todoId = todoId;
}

function deleteTodo(todoId) {
  // Todo: Add a prompt for confirmation
  const todoIndex = allTodos.findIndex((todo) => todo.id === todoId);

  allTodos.splice(todoIndex, 1);
  todoList.querySelector(`[data-todo-id="${todoId}"]`).remove();
  persistTodos();
}

function createTodo(text) {
  const createdDate = new Date();

  const todo = {
    text,
    id: createdDate.getTime().toString(),
    created: createdDate.toISOString(),
  };

  allTodos.push(todo);
  addTodo(todo);
}

function updateTodo(todo) {
  const listItem = todoList.querySelector(`[data-todo-id="${todo.id}"]`);

  // Can't find the item in the DOM
  if (!listItem) {
    return;
  }

  listItem.querySelector("p").textContent = todo.text;
}

function resetTodoForm() {
  editText.textContent = "";
  todoBtn.textContent = "Add Todo";
  todoInput.value = "";
  todoForm.removeAttribute("data-todo-id");
}

function createOrUpdateTodos(event) {
  event.preventDefault();

  const todoText = todoInput.value.trim();

  if (!todoText) {
    window.alert("Enter todo text");

    return;
  }

  const todoId = todoForm.dataset.todoId;

  if (!todoId) {
    createTodo(todoText);
    todoInput.value = "";
    persistTodos();

    return;
  }

  const todoIndex = allTodos.findIndex((todo) => todo.id === todoId);

  if (todoIndex === -1) {
    window.alert("Could not edit todo");
    resetTodoForm();

    return;
  }

  const existingTodo = allTodos[todoIndex];
  const todo = {
    ...existingTodo,
    text: todoText,
  };

  allTodos.splice(todoIndex, 1, todo);
  updateTodo(todo);
  resetTodoForm();
  persistTodos();
}

function retrieveTodos() {
  const todos = window.localStorage.getItem("todos");

  if (!todos) {
    return;
  }

  try {
    allTodos.push(...JSON.parse(todos));
    addTodo(...allTodos);
  } catch {
    console.error("Could not deserialize todos");
  }
}

function persistTodos() {
  window.localStorage.setItem("todos", JSON.stringify(allTodos));
}

function searchTodos(event) {
  const text = event.target.value;
  const regex = new RegExp(text, "gi");

  const todoIds = allTodos
    .filter((todo) => todo.text.search(regex) !== -1)
    .map((todo) => todo.id);

  todoList.querySelectorAll("li").forEach((listItem) => {
    const todoId = listItem.dataset.todoId;
    const match = todoIds.includes(todoId);

    if (!match) {
      listItem.classList.add("invinsible", "d-none");

      return;
    }

    listItem.classList.remove("invinsible", "d-none");
  });
}

window.addEventListener("DOMContentLoaded", retrieveTodos);
todoForm.addEventListener("submit", createOrUpdateTodos);
searchInput.addEventListener("input", searchTodos);
