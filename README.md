# Hello, grader!

## Run the server

Install dependencies
```bash
npm i
```

Run:
```
npm start
```

If your port 3000 is in use, you can change it:

```
PORT=3001 npm start
```

Go to [http://localhost:PORT](http://localhost:PORT) (default 3000) to see the website.

## Credentials
You can sign in with the following credentials, if you want to use an account we made for you, or you can just make your own.

```
Email: grading@stevens.edu
Password: grading
```

## Features and technologies from technical implementation plan

- [x] Next.js
- [x] React
- [x] Typescript
- [x] Redis (see below)
- [x] MongoDB (see below)
- [x] Vercel (check any PR or go to [cs554-final.vercel.app](https://cs554-final.vercel.app/)!)
- [x] AWS (MongoDB and Redis are hosted on AWS) 
- [x] Finance API: we wound up switching to Marketstack due to price (instead of Yahoo Finance or IEXCloud API), but the functionality is the same. 

## Redis info

You can use your own Redis server if you want by setting `REDIS_URL` in the .env file. However, we already have a hosted one configured in .env for you.

## MongoDB info

You can use your own MongoDB database if you want. However, our ORM module (Prisma) uses a feature called replica sets that are tricky to set up on localhost. As
such, we have included a .env file with an AWS-deployed MongoDB server (through Atlas). It's best to just use this server -- if you want to inspect what's going on, check out .env and put the URL into MongoDB Compass -- you'll be able to inspect it the same as a local server.

I also recommend using the already-seeded database since seeing the data can take a little bit of time sometimes.

### I really want to use my own

If you want to change it: set the `DATABASE_URL` environment variable to the URI of your MongoDB server. You can do this by creating a `.env` file in the root directory of the project, and adding the following line:

```
DATABASE_URL=mongodb://127.0.0.1:27017
```

If you're getting an error similar to `Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.`, the easiest way to test is 
by using a free MongoDB Atlas cluster. You can create a free cluster [here](https://www.mongodb.com/cloud/atlas/register). Once you've created a cluster, you can get the URI by clicking on the "Connect" button, and then clicking "Connect your application". You can then copy the URI and paste it into the `.env` file. You can also set up replica sets locally, but it's not easy.

### Seeding with my own server

Seeding should happen automatically when you add a new stock to a portfolio, or view a stock page. You may have to be patient if it is the first time you are adding this position.

## Running the Next.js server

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.