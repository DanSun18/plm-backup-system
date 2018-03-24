//dbOptions.config.js
//configuration for the back up system

module.exports = {
	user: 'plmUser',
	pass: '<password>',
	host: 'real-producers-test.colab.duke.edu',
	port: 27017,
	database: 'plm',
	autoBackup: true,
	removeOldBackup: true,
	keepLastDaysBackup: 2,
	autoBackupPath: './backup/database-backup/',
	retainDailyBackupFor: 7, //days
	retainWeeklyUpdateFor: 4, //weeks
	retainMontlyUpdateFor: 12, //months
};