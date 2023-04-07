require('dotenv').config() // Remove that line if you are in production
const express = require('express')
const axios = require('axios').default
const app = express()
const port = 3000

const seClientID = process.env.SE_CLIENT_ID
const seClientSecret = process.env.SE_CLIENT_SECRET
const seRedirectURI = process.env.SE_REDIRECT_URI 
const seScopes = 'channel:read'

// Home page
app.get('/', async (req, res) => {
  res.status(200).send('<a href="/login">Login with Streamelements</a>')
})

// Login page redirecting to streamelements authorization page
app.get('/login', async (req, res) => {
  res.redirect('https://api.streamelements.com/oauth2/authorize?' +
    new URLSearchParams({
      client_id: seClientID,
      redirect_uri: seRedirectURI,
      response_type: 'code',
      scope: seScopes,
    })
  )
})

// Callback page
app.get('/callback', async (req, res) => {
  if (!req.query.code || req.query.error) {
    console.log('Application not accepted')
    res.status(401).send('Application not accepted')
    return
  }

  try {
    const data = await getAuthentication(req.query.code)
    const channelData = await getChannelData(data.access_token)

    const authenticatedPage = ` \
      <h1>Authenticated!</h1>
      <img src="${channelData.avatar}" /> \
      <div>Display Name: ${channelData.displayName}</div> \
      <div>Account ID: ${channelData._id}</div> \
      <div>Access Token: ${data.access_token}</div> \
      <div>Refresh Token: ${data.refresh_token}</div> \
      <div>Scope list: ${data.scope}</div> \
    `
    res.status(200).send(authenticatedPage)

  } catch (error) {
    res.status(200).send(error.code);
    console.log(error.code);
  }

})

// Get Authentication
async function getAuthentication(code) {
  const { data } = await axios.post('https://api.streamelements.com/oauth2/token?' +
    new URLSearchParams({
      'client_id': seClientID,
      'client_secret': seClientSecret,
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': seRedirectURI
    })
  );
  console.log('Authentication data: ', data)
  return data
}

// Get channel information
async function getChannelData(access_token) {
  const { data } = await axios.get('https://api.streamelements.com/kappa/v2/channels/me', {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `oAuth ${access_token}`
    }
  })
  return data
}

// Start the server
const listener = app.listen(port, () => {
  console.log(`Listening on port ${listener.address().port}`)
})
