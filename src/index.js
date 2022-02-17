const express = require('express');
const cors = require('cors');
const {v4 : uuid} = require('uuid')
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find((a) =>{
    return a.username === username;
  });

  if(!user){
    return response.status(404).json({error : "usuario não encontrado!"})
  }

  request.user = user
  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {
  const {user} = request;
  
  if(user.pro === false && user.todos.length === 10){
    return response.status(404).json({error: "Assine o plano Pro para criar mais de 10 Todos!"})
  }

  next();
}

function checksTodoExists(request, response, next) {
  const {user} = request;
  const {id} = request.params;
  const index = user.todos.findIndex((todo) =>{
    return todo.id === id;
  });

  if(index === -1){
    return response.status(404).json({"error" :"todo não encontrado!"})
  }

  request.todoIndex = index;
  return next();
}

function findUserById(request, response, next) {
  const {id} = request.params;
  const user = users.find((user) =>{
    user.id === id;
  })
  if(!user){
    return response.status(404).json({error: "Usuario não encontrado!"})
  }
  request.user = user;
  next()
  // Complete aqui
}



app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userAlreadyExistis = users.some(user => user.username === username);
 
  if(userAlreadyExistis){
    return response.status(400).json({ error : "Usuario já existe!"})
  }

  const usuario = {
    id: uuid(),
	  name,
	  username,
    pro: false,
	  todos: []
  }

  users.push(usuario);
  return response.status(201).json(usuario)
});

app.get('/todos',checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount,checksCreateTodosUserAvailability, (request, response) => {
const { title , deadline} = request.body;
const {user} = request;

const dateFormat = new Date(deadline);

const todo ={ 
	id: uuid(), // precisa ser um uuid
	title: title,
	done: false, 
	deadline: dateFormat,
	created_at: new Date()
}

user.todos.push(todo)
return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount,checksTodoExists, (request, response) => {
  const {title , deadline} = request.body;
  const {user} = request;
  const {todoIndex} = request;

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  return response.status(201).json(user.todos[todoIndex])
});

app.patch('/todos/:id/done', checksExistsUserAccount,checksTodoExists, (request, response) => {
  const {user} = request;
  const {todoIndex} = request;

  user.todos[todoIndex].done = true;
  return response.status(201).json(user.todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount,checksTodoExists, (request, response) => {
  const {user} = request;
  const {todoIndex} = request;

  user.todos.splice(todoIndex,1)
  return response.status(204).json()
});

module.exports = app;