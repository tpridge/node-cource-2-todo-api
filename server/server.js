require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

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

// DELETE /todos/123456
app.delete('/todos/:id', (req, res) => {
	var id = req.params.id;

	// validate id => not valid return 404

	// remove todo by id
		// success
			// if no doc, send 404
			// if doc, send doc back w/ 200
			//
		// error 
			//400 w/ empty body

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	} else {
		Todo.findByIdAndRemove(id).then((todo) => {
			if (!todo) {
				res.status(404).send();
			} else {
				res.send({todo});
			}
		}).catch((e) => {
			res.status(400).send();
		});
	}

});

app.patch('/todos/:id', (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	})
});

// POST /users
app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	
	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send();
	});
});


app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
			res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Started up at port ${port}`);
});

module.exports = {app};