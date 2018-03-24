# Backup System Guide

## Protect Your Database with Password

We outline the steps to make the database password protected here. If your database is already password protected, you may skip this section. 

### On the server
(adopted from https://ianlondon.github.io/blog/mongodb-auth/)
We assume that mongo is running as a service on your service without password protection. For how to start mongo as a service, see our development guide. If your database is already username-password protected, you may want to skip this part.

1. `ssh` into the server, and start the mongo shell by typing `mongo`.

2. Create a user for your database. In our case, we want to add a user `plmUser` to our database `plm`. The user will have `readWrite` role in the `plm` database.

```
use plm
db.createUser(
  {
    user: "plmUser",
    pwd: <plmPassword>,
    roles: [ { role: "readWrite", db: "plm" } ]
  }
)
```

`<plmPassword>` is a the password for your user, and it is astring such as `"abc123"`.

3. Enable Auth and Open MongoDB access

Edit your MongoDB config file. On Ubuntu, type `sudo vim /etc/mongodb.conf`

Go to the `#security:` section and add the following line. Make sure to un-comment the `security:` line:

```
auth = true
```

Then go to the `net` line and change `bindIp` to `0.0.0.0`. It should look something like this:

```
# network interfaces
bind_ip = 0.0.0.0
``` 

4. If you have not already, open port 27017 on your server by typing `sudo ufw allow 27017`

5. Restart the mongo daemon by typing `sudo service mongod restart`. Make sure you can still log in with mongo while ssh’d into the box.

Note: you can log in as the newly created `plmUser` by typing `mongo -u "plmUser" -p <plmPassword> --authenticationDatabase "plm"` on the server.

### Locally 

(adotped from https://docs.mongodb.com/manual/tutorial/enable-authentication/)

1. Start the MongoDB without access control by navigating to the `mongodb` directory and run

```
sudo ./bin/mongod
```

2. In a separate terminal window, connect a mongo shell to the instance by by typing

```
sudo ./bin/mongo
```

3. Create the user administrator. 

We want to create a user with the `userAdminAnyDatabase` role in the `admin` database. This user has privileges over creating users in other databases. Switch to the `admin` database by typing `use admin` in the mongo shell. Then, type the following command in the mongo shell:

```
db.createUser(
  {
    user: <username>,
    pwd: <password>,
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
```

`<username>` is a string such as `"myUserAdmin"`, and `<password>` is a string such as `"abc123"`.

(Note: You can check for existing users in the database by typing `db.getUsers()`. If you would like to delete any existing user, use `db.dropUser(<username>)`)

Disconnet the Mongo Shell.

4. Re-start the MongoDB instance with access control.

In our case, this means running

```
sudo ./bin/mongod --auth
```

Clients that connect to this instance must now authenticate themselves as a MongoDB user. Clients can only perform actions as determined by their assigned roles.

5. Connect and authenticate as the user administrator

Start the mongo shell by typing 

```
sudo ./bin/mongo -u <username> -p <password> --authenticationDatabase "admin"
```

where `<username>` and `<password>` are the same as you set in step 3 (Do not forget the quotation marks to mark them as string).

6. Create users for your database

Once logged into the mongo shell as your newly created user administrator, you can use `db.createUser()` to create additional users. In our case, we want to add a user `plmUser` to our database `plm`. The user will have `readWrite` role in the `plm` database.

```
use plm
db.createUser(
  {
    user: "plmUser",
    pwd: <plmPassword>,
    roles: [ { role: "readWrite", db: "plm" } ]
  }
)
```

7. Verify by connecting and authenticating as plmUser

Start another mongo shell by typing 

```
sudo ./bin/mongo -u "plmUser" -p <plmPassword> --authenticationDatabase "plm"
```

Perform some database operations to verify that you can do it.

## Configuring and Setting Up the Backup System

### Setting up your server for the backup system

Our system is Ubuntu 16.04 LTS and you will need git, npm and Node.JS on the back up system. Please look at our deployment guide on how to set up your server and install the necessary tools. 

In addition, install `mongodump` by running `sudo apt install mongodb-clients`

### Deploying the backup system from GitHub

1. Clone the repository from GitHub by running
  
```
  git clone https://github.com/DanSun18/plm-backup-system.git
  cd plm-backup-system
```

2. Change necessary configurations. Provide your actual password for the email account and database user in `server/dbOptions.config.js` and `server/email.config.js`. In addition, if you wish to use a different email, make changes to `server/email.config.js` as well as the `sendEmail` function in `server/backup.server.controller.js`.

3. Run `npm install` to install all dependencies. 

4. Use `npm run start-dev` to verify that nothing goes wrong.

5. Use `nohup npm run start-dev >/dev/null 2>&1 & ` to run the server even after you log out the ssh session or close the terminal. The backup routine will run at 10pm New York Time everyday.

6. Alternatively, you could use the scripts `startNonStoppingServer.sh` and `shutdownServer.sh` provided in the repository to start or shutdown the server, respectively.

## Restoring from a backup

## Verify Backup Validity

