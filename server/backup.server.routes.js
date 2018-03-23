// backup.server.routes.js
// this file is created to facilitate testing of the back-up functionality
var express = require('express');
var router = express.Router();
var backup = require('./backup.server.controller');
// var util = require("util");
// var fs = require("fs");

module.exports = function(app) {

	app.route('/test/backup').get( (req, res, next) => 
		{
			console.log("Entered router of backup");
			backup.backup();
			res.send();
		}
	);

};