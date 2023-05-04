## Running the server

### MongoDB Server

Set the `DATABASE_URL` environment variable to the URI of your MongoDB server. You can do this by creating a `.env` file in the root directory of the project, and adding the following line:

```
DATABASE_URL=mongodb://127.0.0.1:27017
```

If you're getting an error similar to `Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.`, the easiest way to test is 
by using a free MongoDB Atlas cluster. You can create a free cluster [here](https://www.mongodb.com/cloud/atlas/register). Once you've created a cluster, you can get the URI by clicking on the "Connect" button, and then clicking "Connect your application". You can then copy the URI and paste it into the `.env` file.

## Running the Next.js server

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.