// backup.server.controller.js
//this file handles the main logic of back up

var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;
//for emailing
var nodemailer = require('nodemailer');
//config files
var dbOptionsLocal = require('./dbOptions.config.js');
var emailConfig = require('./email.config.js');


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

exports.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/*
type: string, can be "daily", "weekly", "monthly"
*/
exports.constructFileName = function(type, currentDate){
	console.log("Construcint file name for backed up file");
	
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;
	const currentDay = currentDate.getDate();
	var newBackupDir = type + '/' + currentYear + '-' + currentMonth + '-' + currentDay;
	var newBackupPath = dbOptionsLocal.autoBackupPath + 'mongodump-' + newBackupDir; // New backup path for current backup process
	console.log("Path of back up file is " + newBackupPath);
	return newBackupPath;
}

exports.getOldBackupFilePath = function(type, currentDate){
	if (dbOptionsLocal.removeOldBackup == true) {
		var beforeDate, oldBackupDir, oldBackupPath;
        beforeDate = _.clone(currentDate);
        console.log("performing " + type + " backup");
        console.log("current date is")
        console.log(beforeDate);
        if(type == "daily"){
        	beforeDate = new Date(beforeDate.getFullYear(), beforeDate.getMonth(), beforeDate.getDate() - dbOptionsLocal.retainDailyBackupFor);
        	// beforeDate.setDate(beforeDate.getDate() - dbOptionsLocal.retainDailyBackupFor); // Substract number of days to keep backup and remove old backup
        } else if (type == "weekly"){
        	const daysInWeek = 7;
        	beforeDate = new Date(beforeDate.getFullYear(), beforeDate.getMonth(), beforeDate.getDate() - dbOptionsLocal.retainWeeklyUpdateFor * daysInWeek);
        	// beforeDate.setDate(beforeDate.getDate() - dbOptionsLocal.retainWeeklyUpdateFor * daysInWeek);
        } else if (type == "monthly"){
        	beforeDate = new Date(beforeDate.getFullYear(), beforeDate.getMonth() - dbOptionsLocal.retainMontlyUpdateFor, 1);
        }
        console.log("Backup to be deleted should be performed on day")
        console.log(beforeDate);
        oldBackupDir = type + '/' + beforeDate.getFullYear() + '-' + (beforeDate.getMonth() + 1) + '-' + beforeDate.getDate();
        oldBackupPath = dbOptionsLocal.autoBackupPath + 'mongodump-' + oldBackupDir; // old backup(after keeping # of days)
    	console.log("old backup file should be stored at " + oldBackupPath);
    	return oldBackupPath;
    }
}

/*
type: string, can be "daily", "weekly", "monthly"
*/
exports.performBackupRoutine = function(type, currentDate){
if (dbOptionsLocal.autoBackup == true){
		console.log("Started " + type + " backup routine");
		const oldBackupPath = this.getOldBackupFilePath(type, currentDate);
		const newBackupPath = this.constructFileName(type, currentDate);
		var cmd = '~/Applications/mongodb/bin/mongodump --host ' + dbOptionsLocal.host + ' --port ' + dbOptionsLocal.port + ' --db ' + dbOptionsLocal.database + ' --username ' + dbOptionsLocal.user + ' --password ' + dbOptionsLocal.pass + ' --out ' + newBackupPath; // Command for mongodb dump process
		const me = this;
		console.log("Ready to execute command:")
		console.log(cmd);
        //prepare email subject and text
        var emailSubject = this.capitalizeFirstLetter(type) + " Backup Notification";
        var emailText = "";
		exec(cmd, function(error, stdout, stderr) {
			if (me.empty(error)) {
				console.log("Database backup dumped to " + newBackupPath);
                const successfulBackupLine = "Your backup was stored successfully at " + newBackupPath + " on the backup server.\n\n";
                emailText = emailText + successfulBackupLine;
				if (dbOptionsLocal.removeOldBackup == true) { //remove old backup 
                    if (fs.existsSync(oldBackupPath)) {
                    	console.log("Removing old backup at " + oldBackupPath)
                        exec("rm -rf " + oldBackupPath, function (err) {
                                if (me.empty(error)) {
                                    console.log("Old data dump at " + oldBackupPath + " is deleted");
                                    const successfulDeletionLine = "Your backup stored at " + oldBackupPath + " was deleted due to retention policy.\n\n";
                                    emailText = emailText + successfulDeletionLine;
                                } else {
                                    console.log("Error encountered during deletion of old data at " + oldBackupPath);
                                    console.log(error);
                                    const failDeletionLine = "Error: Failed to delete backup stored at " + oldBackupPath + " even though it exists.\n\n";
                                    emailText = emailText + failDeletionLine;
                                    //also add error to subject line
                                    emailSubject = "ERROR: " + emailSubject;
                                }
                                me.sendEmail(emailSubject, emailText);
                                
                            }
                        );
                    } else {
                        me.sendEmail(emailSubject, emailText);
                    }
                }
			} else {
				console.log("error encountered during backup");
				console.log(error);
                emailText = "An error occured during back up!\n\n" + error;
                emailSubject = "ERROR: " + emailSubject;
                me.sendEmail(emailSubject, emailText); 
			}
		});
	}
}



exports.performDailyBackup = function(currentDate){
	console.log('Performing Daily Backup');
	const backupType = "daily";
	this.performBackupRoutine(backupType, currentDate);
	
}

exports.performWeeklyBackup = function(currentDate){
	console.log('Performing Weekly Backup');
	const backupType = "weekly";
	this.performBackupRoutine(backupType, currentDate);
}

exports.performMonthlyBackup = function(currentDate){
	console.log('Performing Monthly Backup');
	const backupType = "monthly";
	this.performBackupRoutine(backupType, currentDate);
}
//entry point for testing purposes
exports.backup = function(){
	console.log("Entered  backup controller entry point");
	var date = new Date();
	currentDate = this.stringToDate(date); //current date

	this.performDailyBackup(currentDate);
	if(currentDate.getDay() == 1){ //Monday
		this.performWeeklyBackup(currentDate);
	}
	if(currentDate.getDate() == 1){ //monthly back up on the first of every month
		this.performMonthlyBackup(currentDate);
	}
	console.log("Exited  backup controller entry function");
	
}

exports.sendEmailTesting = function() {
    this.sendEmail('Test Email', 'Successful');
}

exports.sendEmail = function(subject, text) {
    var transporter = nodemailer.createTransport(emailConfig);
    var mailOptions = {
        from: 'realproducers458@gmail.com',
        to: 'realproducers458@gmail.com',
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            console.log(error);
            console.log("Error: see info above");
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Auto backup script as adopted from tutorial
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