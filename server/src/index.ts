// server/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AzureOpenAI } from "openai";

dotenv.config();

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-04-01-preview";
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const modelName = process.env.AZURE_OPENAI_MODEL_NAME || "gpt-4.1-mini";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-mini";
const options = {
  apiKey,
  apiVersion,
  endpoint,
  deployment,
};

const client = new AzureOpenAI(options);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (_req: Request, res: Response): void => {
  res.send("NexusTalk Server is running.");
});

app.post("/analyze", async (req: Request, res: Response): Promise<void> => {
  // res.json({
  //   nodes: [
  //     {
  //       id: "n1",
  //       label: "来期の戦略としてA案を推進すべきだと考えている",
  //       type: "主張",
  //       speaker: "佐藤",
  //       utterance: "来期の戦略ですが、私はA案を推進すべきだと考えています。",
  //     },
  //     {
  //       id: "n2",
  //       label: "A案はB案よりコストを低く抑えられるので賛成",
  //       type: "賛成",
  //       speaker: "田中",
  //       utterance:
  //         "佐藤さんに賛成です。B案と比較してコストを低く抑えられますからね。",
  //     },
  //     {
  //       id: "n3",
  //       label:
  //         "A案は低コストだが、市場投入後のリスクが高いデータがある。その点について質問",
  //       type: "質問",
  //       speaker: "鈴木",
  //       utterance:
  //         "少し待ってください。A案は確かに低コストですが、市場投入後のリスクが高いというデータもあります。その点はどうお考えですか？",
  //     },
  //   ],
  //   edges: [
  //     {
  //       id: "e1",
  //       source: "n2",
  //       target: "n1",
  //       type: "support",
  //     },
  //     {
  //       id: "e2",
  //       source: "n3",
  //       target: "n1",
  //       type: "question",
  //     },
  //   ],
  // });
  // console.log("Mock response sent for /analyze endpoint");
  // return;
  const data = req.body.data;
  if (!Array.isArray(data)) {
    res.status(400).json({ error: "Invalid input format. Expected an array." });
    return;
  }

  try {
    // Azure OpenAIへのプロンプト生成
    const prompt = `
以下は会議の発言リストです。各発言の「type」（主張・根拠・質問・賛成・反対）と、発言間の「関係性」（どの発言がどの発言に賛成/反対/質問しているか）を抽出し、下記のJSON形式で出力してください。

【厳守事項】
- 出力は必ず有効なJSONのみ。JSON以外の文字列や説明文は一切含めない。
- JSONはコードブロックやバッククォートで囲まない。
- 値が空の場合も必ずダブルクォートで囲む。
- "\n"は使用せず、改行は含めない。
- 例外やエラーが発生しても必ず空のJSON（{"nodes":[],"edges":[]}）を返す。
- 発言の要約は、日本語で15文字以内で、簡潔にまとめること。
- 最後に、JSONのフォーマットが正しいことを確認するため、JSONのバリデーションを行うこと。

{
  "nodes": [
    { "id": "n1", "label": "発言要約", "type": "主張", "speaker": "佐藤", "utterance": "発言全文" }
  ],
  "edges": [
    { "id": "e1", "source": "2", "target": "1", "type": "agree" }
  ]
}

発言リスト:
${JSON.stringify(data, null, 2)}
`;

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: "あなたは会議分析AIです。" },
      { role: "user", content: prompt },
    ];

    const result = await client.chat.completions.create({
      messages,
      max_tokens: 10000,
      temperature: 1,
      model: modelName,
    });

    console.log("Azure OpenAI response:", result);

    const content = result.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from Azure OpenAI." });
      return;
    }
    try {
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "content:", content);
      res.status(500).json({
        error: "Failed to analyze discussion.",
        detail: String(parseErr),
        content,
      });
      return;
    }
  } catch (err) {
    console.error("Analyze discussion error:", err);
    res
      .status(500)
      .json({ error: "Failed to analyze discussion.", detail: String(err) });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
