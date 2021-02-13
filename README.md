![Typescript compiler](https://github.com/chingu-voyages/v25-bears-team-05-repo2/workflows/Typescript%20compiler/badge.svg)

# [![SyncedUp](./assets/logo-dark.svg)](https://syncedup.live/) | SyncedUp API

### About

This is the API portion of the SyncedUp project (a full-stack LinkedIn clone). The other repo can be found [here](https://github.com/chingu-voyages/v25-bears-team-05).

### Features

- Register for an account using local authentication (email/password), or using their Google account with Google oAuth.

- Sign-in to the service.
- Add/remove connections to your profile.
- Create posts
- View posts from connections.
- Receive connection suggestions

- Log out of the service

### Future features (nice to haves)

- Push notifications
- Private messaging
- Job posts
- Event listings
- Continual learning and skill-building features
- Groups

### Tech Stack

- nodejs
- express
- typescript
- mongoose, mongoDb
- jest

For authentication:

- Passport js
- Google oAuth

Validation:

- express-validator

Other tools:

- lodash

### Installation instructions

1. Clone the repo and run `npm i` to install dependencies
2. Install typescript
3. Install mongoDb
4. Register the app with google oAuth. Follow [these instructions](https://developers.google.com/identity/protocols/oauth2)
5. Create a `.env` file using the `sample.env` file
   provided as a model. Fill in the details.

### Running the app and tests

- Run `npm start` to start the server
- Run `npm t` to run jest unit tests

### Building the app

- Run `npm run tsc` to compile

### Deployment instructions

#### Heroku setup

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
1. Login
   - `$ heroku login`
1. Create Heroku app
   - `$ heroku create <your heroku app name>`
   - Or using the [Heroku dashboard](https://dashboard.heroku.com/)
1. Set a git remote named heroku to your Heroku app
   - `$ heroku git:remote -a <your heroku app name>`
1. Add nodejs heroku buildpack
   - `heroku buildpacks:set heroku/nodejs`

#### Heroku deploy

1. Set environment variables on Heroku app (if first time or they've changed)
   - `$ heroku config:set $(<.env)`
1. Deploy a branch to heroku master
   - `$ git push heroku <your branch to deploy>:master`
   
#### Run jest tests
-  `$ npm t`

## API Routes

### <b>Feed</b>

Method: GET <br>
Endpoint: `/feed`<br>
Description: returns threads authored by connections, connection suggestions and public posts

### <b>Threads</b>

Method: POST <br>
Endpoint: `/threads` <br>
Body: `htmlContent`, `threadType`, `visibility`, `hashTags`, `attachments`<br>
Description: Creates a thread for the requester's profile

### <b>Users</b>

Method: GET<br>
Endpoint: `/users/:id` <br>
Description: Get requester's profile data <br>
Parameter: userId of requester

Method: GET<br>
Endpoint: `/users/:id/connections` <br>
Description: Gets user's connections <br>
Parameter: userId of requester

Method: PUT<br>
Endpoint: `/users/connections/:id` <br>
Description: Adds connection requester's profile <br>
Parameter: userId to add as connection

Method: DELETE<br>
Endpoint: `/users/connections/:id` <br>
Description: Deletes a connection from requester's profile<br>
Parameter: userId to delete from connection

Method: PATCH <br>
Endpoint: `/users/:id` <br>
Description: Update requester's profile details <br>
Body: optional parameters: `firstName`, `lastName` `avatar`, `jobTitle`

Method: GET <br>
Endpoint: `/users/:id/threads` <br>
Description: Gets a user's threads <br>
Params: `id` is either `me` referring to requester's own profile, or the profile `id` of another user.

### <b>Auth</b>

Method: GET <br>
Endpoint: `/auth/google/callback`<br>
Description: Google oAuth route

Method: POST <br>
Endpoint: `/auth/local`<br>
Description: local login (with e-mail and password)

### <b>Logout</b>

Method: POST<br>
Endpoint: `/logout`<br>
Description: log out of service and expire cookie

### <b>Register-local</b>

Method: POST<br>
Endpoint: `/register/local`<br>
Description: log-in using local authentication<br>

### <b>Search</b>

Method: GET<br>
Endpoint: in progress<br>
Description: in progress <br>
