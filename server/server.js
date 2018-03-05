var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, resp) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		resp.send(doc);
	}, (e) => {
		resp.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({ todos });
	}, (e) => {
		resp.status(400).send(e);
	});
});


// GET /todos/123456
app.get('/todos/:id', (req, res) => {
	var id = req.params.id;

	// valdate id using isValid
		// 404 - send back empty body
	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	} else {
		Todo.findById(id).then((todo) => {
			if (!todo) {
				res.status(404).send();
			} else {
				res.send({todo});
			}
		}).catch((e) => {
			res.status(400).send();
		});
	}

	// findById
		// success 
			// if todo - send it back
			// if no todo - send back 404 with empty body
		// error
			// 400 - and send empty body back
});

app.listen(3000, () => {
	console.log('Started on port 3000');
});

module.exports = {app};