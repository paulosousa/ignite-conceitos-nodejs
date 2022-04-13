const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found"});
  }

  request.user = user;

  return next();
}

function checksExistisTodo(request, response, next) {
  const todoId = request.params.id;
  const user = request.user;
  const todo = user.todos.find((todo) => todo.id === todoId);
  if(!todo) {
    response.status(404).json({error: "Todo not found"})
  }
  request.todo = todo
  
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const user = users.find((user) => user.username === username);
  if(user != null) {
    return response.status(400).json({error: "User already exists"})
  }

  const addUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(addUser);

  response.status(201).json(addUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistisTodo, (request, response) => {
  const {title, deadline} = request.body;
  const todo = request.todo;

  todo.title = title;
  todo.deadline = deadline;

  response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistisTodo, (request, response) => {
  const todo = request.todo;

  todo.done = true;

  response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistisTodo, (request, response) => {
  const todo = request.todo;
  const user = request.user;

  user.todos.splice(todo, 1);

  response.status(204).json(user.todos);
});

module.exports = app;