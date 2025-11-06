import { useState } from "react";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import axios from "axios";

import GraphView from "./components/GraphView";
import type { MapNode, MapEdge } from "./components/GraphView";
import { Stack } from "@mui/material";

const App = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<{
    nodes: MapNode[];
    edges: MapEdge[];
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  const handleGenerateMap = async () => {
    setLoading(true);
    setError(null);
    setMapData(null);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setError("JSONは配列形式で入力してください。");
        setLoading(false);
        return;
      }
      const res = await axios.post<{ nodes: MapNode[]; edges: MapEdge[] }>(
        "http://localhost:3001/analyze",
        { data: parsed }
      );
      if (
        res.data &&
        Array.isArray(res.data.nodes) &&
        Array.isArray(res.data.edges)
      ) {
        setMapData(res.data);
      } else {
        setMapData(null);
        setError("APIレスポンスの形式が不正です");
      }
    } catch (err: unknown) {
      setMapData(null);
      if (err instanceof SyntaxError) {
        setError("有効なJSONを入力してください。");
      } else if (
        axios.isAxiosError<{ error?: string }>(err) &&
        err.response?.data?.error
      ) {
        setError("サーバーエラー: " + (err.response.data.error ?? ""));
      } else {
        setError("サーバー通信に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        // minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)",
        // p: { xs: 1, sm: 2 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 2,
          mt: 3,
          fontWeight: 700,
          letterSpacing: 2,
          color: "#1976d2",
          textShadow: "0 2px 8px #fff8",
        }}
      >
        NexusTalk
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, md: 5 },
          width: "90%",
          // maxWidth: 1200,
          flex: 1,
          justifyContent: "center",
          alignItems: "stretch",
          maxHeight: "85%",
          // marginBottom: 400,
          // paddingBottom: "20rem",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            flex: 1,
            minWidth: 0,
            // minHeight: 400,
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            borderRadius: 4,
            boxShadow: "0 4px 24px #1976d220",
            bgcolor: "#fff",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              height: { xs: 400, sm: 500, md: 600, lg: 700, xl: 800 },
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 2px 12px #1976d210",
              bgcolor: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2, sm: 3 },
            }}
          >
            <TextField
              label="会議の文字起こしデータ（JSON配列）"
              multiline
              minRows={8}
              maxRows={16}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"speaker":"佐藤","utterance":"..."}, ...]'
              fullWidth
              variant="outlined"
              sx={{
                fontFamily: "monospace",
                width: "100%",
                // maxWidth: 520,
                height: "100%",
                verticalAlign: "baseLine",
                // height: 600,
              }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                width: "100%",
                // maxWidth: 480,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateMap}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : "マップを生成"}
              </Button>
              {error && (
                <Alert severity="error" sx={{ flex: 1 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Stack>
        </Paper>
        <Paper
          elevation={4}
          sx={{
            flex: 1,
            minWidth: 0,
            // minHeight: 400,
            p: { xs: 2, sm: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            boxShadow: "0 4px 24px #1976d220",
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 700,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 2px 12px #1976d210",
              bgcolor: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SigmaContainer style={{ width: "100%", height: "100%" }}>
              {mapData && mapData.nodes && mapData.edges ? (
                <GraphView
                  nodes={mapData.nodes}
                  edges={mapData.edges}
                  onNodeClick={setSelectedNode as (node: MapNode) => void}
                />
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    mt: 8,
                    fontSize: 18,
                    opacity: 0.7,
                  }}
                >
                  議論マップはここに表示されます
                </Typography>
              )}
            </SigmaContainer>
            {/* 発言詳細パネル */}
            {selectedNode && (
              <Box
                sx={{
                  position: "absolute",
                  top: 32,
                  right: 32,
                  width: 340,
                  maxWidth: "90vw",
                  bgcolor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 4px 24px #1976d240",
                  p: 3,
                  zIndex: 10,
                  border: "2px solid #1976d2",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: "#1976d2" }}>
                  発言詳細
                </Typography>
                {selectedNode && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: "#888" }}>
                      スピーカー: {selectedNode.speaker ?? "（不明）"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ mt: 1, whiteSpace: "pre-line" }}
                    >
                      {selectedNode.utterance ?? "（発言内容なし）"}
                    </Typography>
                  </>
                )}
                {!selectedNode && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: "#888" }}>
                      スピーカー: （不明）
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ mt: 1, whiteSpace: "pre-line" }}
                    >
                      （発言内容なし）
                    </Typography>
                  </>
                )}
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => setSelectedNode(null)}
                >
                  閉じる
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default App;
