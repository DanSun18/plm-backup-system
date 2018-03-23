// backup.server.controller.js
//this file handles the main logic of back up

var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;

var dbOptionsLocal = require('./dbOptions.config.js');


/* return date object */
exports.stringToDate = function (dateString) {
    return new Date(dateString);
}

/* return if variable is empty or not. */
exports.empty = function(mixedVar) {
    var undef, key, i, len;
    var emptyValues = [undef, null, false, 0, '', '0'];
    for (i = 0, len = emptyValues.length; i < len; i++) {
        if (mixedVar === emptyValues[i]) {
        return true;
        }
    }
    if (typeof mixedVar === 'object') {
        for (key in mixedVar) {
return false;
        }
        return true;
    }
    return false;
};

exports.constructFileName = function(){
	console.log("Construcint file name for backed up file");
	var date = new Date();
	var beforeDate, oldBackupDir, oldBackupPath;
	currentDate = this.stringToDate(date); //current date
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;
	const currentDay = currentDate.getDate();
	var newBackupDir = currentYear + '-' + currentMonth + '-' + currentDay;
	var newBackupPath = dbOptionsLocal.autoBackupPath + 'mongodump-' + newBackupDir; // New backup path for current backup process
	console.log("Path of back up file is " + newBackupPath);
	return newBackupPath;
}

//back up once, for testing purposes
exports.backup = function(){
	console.log("Entered controller of backup");
	if (dbOptionsLocal.autoBackup == true){
		console.log("started back up protocol");
		//not checking for removing old backup yet
		const newBackupPath = this.constructFileName();
		var cmd = '~/Applications/mongodb/bin/mongodump --host ' + dbOptionsLocal.host + ' --port ' + dbOptionsLocal.port + ' --db ' + dbOptionsLocal.database + ' --username ' + dbOptionsLocal.user + ' --password ' + dbOptionsLocal.pass + ' --out ' + newBackupPath; // Command for mongodb dump process
		const me = this;
		console.log("Ready to execute command:")
		console.log(cmd);
		exec(cmd, function(error, stdout, stderr) {
			if (me.empty(error)) {
				console.log("Database backup dumped to " + newBackupPath);
			} else {
				console.log("error encountered during backup");
				console.log(error);
			}
		});
	}
}
// Auto backup script
exports.dbAutoBackUp = function () {
// check for auto backup is enabled or disabled
    if (dbOptionsLocal.autoBackup == true) {
        var date = new Date();
        var beforeDate, oldBackupDir, oldBackupPath;
        currentDate = this.stringToDate(date); // Current date
        var newBackupDir = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
        var newBackupPath = dbOptionsLocal.autoBackupPath + 'mongodump-' + newBackupDir; // New backup path for current backup process
        // check for remove old backup after keeping # of days given in configuration
        if (dbOptionsLocal.removeOldBackup == true) {
            beforeDate = _.clone(currentDate);
            beforeDate.setDate(beforeDate.getDate() - dbOptionsLocal.keepLastDaysBackup); // Substract number of days to keep backup and remove old backup
            oldBackupDir = beforeDate.getFullYear() + '-' + (beforeDate.getMonth() + 1) + '-' + beforeDate.getDate();
            oldBackupPath = dbOptionsLocal.autoBackupPath + 'mongodump-' + oldBackupDir; // old backup(after keeping # of days)
        }
        var cmd = 'mongodump --host ' + dbOptionsLocal.host + ' --port ' + dbOptionsLocal.port + ' --db ' + dbOptionsLocal.database + ' --username ' + dbOptionsLocal.user + ' --password ' + dbOptionsLocal.pass + ' --out ' + newBackupPath; // Command for mongodb dump process
        const me = this;
        exec(cmd, function (error, stdout, stderr) {
            if (me.empty(error)) {
                // check for remove old backup after keeping # of days given in configuration
              if (dbOptionsLocal.removeOldBackup == true) {
                    if (fs.existsSync(oldBackupPath)) {
                        exec("rm -rf " + oldBackupPath, function (err) { });
                    }
                }
            }
        });
    }
}