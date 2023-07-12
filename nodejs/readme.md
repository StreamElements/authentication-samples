# Authentication sample for Nodejs
This is a simple authentication sample to help you to create your own page

## Install Node.js:

Node.js is needed to use this sample. Download and install it from https://nodejs.org/

## Change the .env file

This should be done only in a dev environment. In a production server, you should have the environment variables set in a safe place

Open the file .env and change the values of `SE_CLIENT_ID`, `SE_CLIENT_SECRET` and `SE_REDIRECT_URI` to the ones you received from Streamelements

## Change the hosts file (optional)

As Streamelements only provides the production callback URI and it is not possible to have a localhost URI, this step should be done in case you want to test it locally.
See below how to change the hosts file on Windows and Linux

### Windows
Open the file `C:\Windows\System32\drivers\etc\hosts` with a notepad as Administrator
Go to the last line and type the following (replace your_callback_uri for your own callback URI):

`127.0.0.1   your_callback_uri`

For example, in case your callback URI is `https://mywebsite.com/callback`, it would be like that:

`127.0.0.1   mywebsite.com`

Save the file and restart your browser. Once you finish testing locally, remove that line from hosts file.

### Linux

Edit the file `/etc/hosts` with any editor as root

Go to the last line and type the following (replace your_callback_uri for your own callback URI):

`127.0.0.1   your_callback_uri`

For example, in case your callback URI is `https://mywebsite.com/callback`, it would be like that:

`127.0.0.1   mywebsite.com`

Save the file and restart your browser. Once you finish testing locally, remove that line from hosts file.

## Install the package dependencies

Open a terminal and go to the folder where you have the files

`cd /path/to/your/folder/`

Install the dependencies running the following in the terminal: 

`npm install -y`

## Start the application

After that, run the command below to start the server

`node index.js`

Open a webpage and you will see the login button. After authenticated, you will see the user's Twitch avatar, display name and account ID

In case it is not working, check the port and the callback URI.

## Known issue
In case you are testing locally, once you authorized the application, it will show a "page not found" or "Hmmm… can't reach this page".

Solution: Change the `https://` to `http://` and add the port you are using in your code as the example below (in the example it uses the port 3000).

`http://mywebsite.com:3000/callback?code=QRCyDO6DJCajAijzoUkeF2&state=`
