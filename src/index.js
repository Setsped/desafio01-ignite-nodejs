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
    return response.status(400).json({"error" : "usuario não encontrado!"})
  }
  request.user = user
  return next();
  // Complete aqui
}

app.post('/users', (request, response) => {
  const {user, username} = request.body;
  const userAlreadyExistis = users.find(user => user.username === username);
 
  if(userAlreadyExistis){
    return response.status(400).json({ error : "Usuario já existe!"})
  }

  const usuario = {
    id: uuid(),
	  user,
	  username, 
	  todos: []
  }

  users.push(usuario);
  return response.status(201).json(usuario)

});

app.get('/todos',checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
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

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title , deadline} = request.body;
  const {id} = request.params;
  const {user} = request;

  const index = user.todos.findIndex((todo) =>{
    return todo.id === id;
  });

  if(index === -1){
    return response.status(404).json({"error" :"Id não encontrada!"})
  }

  user.todos[index].title = title;
  user.todos[index].deadline = new Date(deadline);

  return response.status(201).json(user.todos[index])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params

  const index = user.todos.findIndex((todo) =>{
    return todo.id === id;
  });

  if(index === -1){
    return response.status(404).json({"error" :"Id não encontrada!"})
  }

  user.todos[index].done = true;

  return response.status(201).json(user.todos[index])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const todo = user.todos.filter((todo) =>{
    return todo.id === id;
  });

  if(todo.length === 0){
    return response.status(404).json({"error":"todo não encontrada!"})
  }

  user.todos.splice(todo,1)

  return response.status(204).json({"message":"deletado!"})
});

module.exports = app;