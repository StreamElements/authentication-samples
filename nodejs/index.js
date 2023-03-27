require('dotenv').config() // Remove that line if you are in production
const express = require('express')
const axios = require('axios').default
const app = express()
const port = 3000

const seClientID = process.env.SE_CLIENT_ID
const seClientSecret = process.env.SE_CLIENT_SECRET
const seRedirectURI = process.env.SE_REDIRECT_URI 
const seScopes = 'channel:read'

// Creating basic style to the page
const style = ' \
<style> \
  html { \
    background-color: #272626; \
    color: #afaf87ff; \
  } \
  .seButton { \
    text-decoration: none; \
    border: 0.2px solid #000; \
    color: #000; \
    background: #8AE020; \
    padding: 10px; \
    margin: 20px \
  } \
  .authentication { \
    display: flex; \
    align-items: center; \
    justify-content: center; \
    flex-direction: column; \
    font-size: 2em; \
    font-family: monospace \
  } \
</style> \
'

const helloMessage = ' \
<p> \
  <h1>Hello!</h1> \
</p> \
'

const loginButton = ' \
<p> \
<a href="/login" class="seButton">Login with Streamelements</a> \
</p> \
'

// Home page
app.get('/', async (req, res) => {
  res.status(200).send(style + helloMessage + loginButton)
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
    const unauthorizedPage = ` \
    <div class="authentication"> \
      <p>Application not accepted</p> \
      <a href="./../">Previous page</a> \
    </div> \
    `
    res.status(401).send(style + unauthorizedPage)
    return
  }

  try {
    const data = await getAuthentication(req.query.code)
    const channelData = await getChannelData(data.access_token)

    const authenticatedPage = ` \
    <div class="authentication"> \
      <h1>Authenticated!</h1>
      <img style="border-radius: 50%;" src="${channelData.avatar}" /> \
      <div><strong>Display Name:</strong> ${channelData.displayName}</div> \
      <div><strong>Account ID:</strong> ${channelData._id}</div> \
    </div> \
    `
    res.status(200).send(style + authenticatedPage)

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

const listener = app.listen(port, () => {
  console.log(`Listening on port ${listener.address().port}`)
})
