// server/src/index.ts
import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (_req: Request, res: Response): void => {
  res.send("NexusTalk Server is running.");
});

app.post("/analyze", (req: Request, res: Response): void => {
  const data = req.body;
  if (!Array.isArray(data)) {
    res.status(400).json({ error: "Invalid input format. Expected an array." });
    return;
  }
  // 今後: Azure OpenAI連携・議論マップ生成ロジックを追加
  res.json({ nodes: [], edges: [] });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
