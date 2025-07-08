// server/src/index.ts
import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("NexusTalk Server is running.");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
