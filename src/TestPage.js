// TestPage.js

import React, { Component } from 'react';
import axios from 'axios'

class TestPage extends Component {

async testBackup(){
		console.log("Entered testBackup()");
		const getUrl = "./test/backup" ;
		//do something useful
		await axios.get(getUrl);
		console.log("Exiting testBackup()");
	}

	async testEmail(){
		console.log("Entered testEmail()");
		const getUrl = "./test/email" ;
		//do something useful
		await axios.get(getUrl);
		console.log("Exiting testEmil()");
	}

 render() {
 return (
 <div>
 <h2>Test Button</h2>
 <button onClick={this.testBackup}>
 Test Backup
 </button>
  <button onClick={this.testEmail}>
 Test Email
 </button>
 </div>
 )
 }
}
export default TestPage;