## Running the server

You can either run a local MongoDB server, or use the staging/dev MongoDB server (if you have permission).

### Local MongoDB server

Set the `DATABASE_URL` environment variable to the URI of your local MongoDB server. You can do this by creating a `.env` file in the root directory of the project, and adding the following line:

```
DATABASE_URL=mongodb://127.0.0.1:27017
```

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.