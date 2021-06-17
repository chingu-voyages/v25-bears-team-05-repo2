![Typescript compiler](https://github.com/chingu-voyages/v25-bears-team-05-repo2/workflows/Typescript%20compiler/badge.svg)

# [![SyncedUp](./assets/logo-dark.svg)](https://syncedup.live/) | SyncedUp API

### About

This is the API portion of the SyncedUp project (a full-stack LinkedIn clone). The other repo can be found [here](https://github.com/chingu-voyages/v25-bears-team-05).

### Features

#### Authentication
- Register for an account using local authentication (email/password), or using their Google account with Google oAuth.
- Sign-in to the service.
- Log out of the service

#### Account Features
- Update user avatar
- Password recovery
#### Social Media Features
- Add and remove users to and from your social network.
- Create and reply to posts
- View posts from connections.
- Receive connection suggestions

#### Search
- Use keyword search to find users and user posts
#### Notifications
- Receive notifications like connection requests
### Future features (nice to haves)

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

#### Google reCaptcha v2
1. Visit [Google reCaptcha console](https://www.google.com/recaptcha/) to register the app and obtain secret keys.
   - Ensure you are registering for version `v2` of reCaptcha
2. The console should generate two keys:
   - The `Site key` (`REACT_APP_DEV_CAPTCHA_SITE_KEY`) is for use with the *front end* to generate the reCaptcha
   - The `Secret key` (`DEV_CAPTCHA_SECRET_KEY`) is used for in the Syncedup api to communicate with Google's 
      reCaptcha verification server
3. In the console, ensure to add `localhost` to the list of domains so you can     
   locally test the reCaptcha

### Running the app in development mode

- Run `npm run dev` to start the server
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
   
#### Tests
##### Run the test suite and display test coverage stats
-  `$ npm run test-coverage`

##### Test-build the typescript
- `$ npm run test-build`
