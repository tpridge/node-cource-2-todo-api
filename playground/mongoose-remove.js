const {ObjectID} = require('mongodb');

const {mongoose} = require("./../server/db/mongoose");
const {Todo} = require("./../server/models/todo");
const {User} = require("./../server/models/user");

// Todo.remove({}).then((result) => {
// 	console.log(result);
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findByIdAndRemove('5aaf052231bb7029208c21be').then((todo) => {
	console.log(todo);
});