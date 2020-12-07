![Typescript compiler](https://github.com/chingu-voyages/v25-bears-team-05-repo2/workflows/Typescript%20compiler/badge.svg)
# SyncedUp API

### About

---

This is the API portion of the SyncedUp project (a full-stack LinkedIn clone). The other repo can be found here.

### Features

---

- Register for an account using local authentication (email/password), or using their Google account with Google oAuth.

- Sign-in to account.
- Add/remove connections to your profile.
- Create posts

- Log out of the service
- Data persistence using

### Future features (nice to haves)

---

- Push notifications
- Private messaging
- Job posts
- Event listings
- Continual learning and skill-building features
- Groups

### Tech Stack

---

The back-end is part of a MERNT stack.

- nodejs
- express
- typescript
- mongoose
- jest

For authentication:

- Passport js
- Google oAuth

Validation:

- express-validator

Other tools:

- lodash

### Installation instructions

---

1. Clone the repo and run `npm i` to install dependencies
2. Install typescript
3. Install mongoDb
4. Register the app with google oAuth. Follow [these instructions](https://developers.google.com/identity/protocols/oauth2)
5. Create a `.env` file using the `sample.env` file
   provided as a model. Fill in the details.

### Running the app and tests

---

- Run `npm run dev` to start the server
- Run `npm t` to run jest unit tests

### Deployment instructions

---

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
1. Set environment varibles on Heroku app (if first time or they've changed)
    - `$ heroku config:set $(<.env)`
1. Deploy a branch to heroku master
    - `$ git push heroku <your branch to deploy>:master`
## API Routes

To be filled out
