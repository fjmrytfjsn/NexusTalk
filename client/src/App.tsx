import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
} from "@react-sigma/core";
import Graph from "graphology";
import "./App.css";

type MapNode = {
  id: string;
  label: string;
  type: string;
  speaker: string;
  utterance: string;
};

type MapEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
};

function App() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<{
    nodes: MapNode[];
    edges: MapEdge[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
  };

  const handleGenerateMap = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setError("JSONは配列形式で入力してください。");
        return;
      }
      setError(null);
      setLoading(true);
      setMapData(null);
      // APIエンドポイントは仮で /api/analyze
      const res = await axios.post<{ nodes: MapNode[]; edges: MapEdge[] }>(
        "/api/analyze",
        { data: parsed }
      );
      setMapData(res.data);
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setError("有効なJSONを入力してください。");
      } else if (
        err &&
        typeof err === "object" &&
        (err as AxiosError).isAxiosError
      ) {
        const axiosErr = err as AxiosError<{ error: string }>;
        if (
          axiosErr.response &&
          axiosErr.response.data &&
          axiosErr.response.data.error
        ) {
          setError("サーバーエラー: " + axiosErr.response.data.error);
        } else {
          setError("サーバー通信に失敗しました。");
        }
      } else {
        setError("サーバー通信に失敗しました。");
      }
      setMapData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nexus-app">
      <h1>NexusTalk 議論マップ生成</h1>
      <textarea
        value={jsonInput}
        onChange={handleInputChange}
        placeholder="会議の文字起こしデータ（JSON配列）を貼り付けてください"
        rows={12}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 14 }}
      />
      <br />
      <button
        onClick={handleGenerateMap}
        style={{ marginTop: 12 }}
        disabled={loading}
      >
        {loading ? "生成中..." : "マップを生成"}
      </button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      <div id="discussion-map" style={{ marginTop: 32, minHeight: 400 }}>
        {mapData ? (
          <SigmaContainer style={{ height: 400, width: "100%" }}>
            <GraphLoader nodes={mapData.nodes} edges={mapData.edges} />
          </SigmaContainer>
        ) : (
          <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            議論マップはここに表示されます
          </div>
        )}
      </div>
    </div>
  );
}

function GraphLoader({ nodes, edges }: { nodes: MapNode[]; edges: MapEdge[] }) {
  const loadGraph = useLoadGraph();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // ノード・エッジの色分け
  const getEdgeColor = (type: string) => {
    if (type === "support" || type === "agree") return "#2ecc40"; // 緑
    if (type === "oppose" || type === "question") return "#ff9800"; // オレンジ
    return "#888";
  };

  React.useEffect(() => {
    const graph = new Graph();
    nodes.forEach((n) => {
      graph.addNode(n.id, {
        label: n.label,
        color: "#1976d2",
        size: 18,
        speaker: n.speaker,
        utterance: n.utterance,
        type: n.type,
      });
    });
    edges.forEach((e) => {
      graph.addEdge(e.source, e.target, {
        color: getEdgeColor(e.type),
        type: "arrow",
        edgeType: e.type,
      });
    });
    loadGraph(graph);
    setSelectedNode(null);
  }, [nodes, edges, loadGraph]);

  const register = useRegisterEvents();
  React.useEffect(() => {
    register({
      clickNode: (e: { node: string }) => {
        setSelectedNode(e.node);
      },
    });
  }, [register]);

  const nodeDetail = selectedNode
    ? nodes.find((n) => n.id === selectedNode)
    : null;

  return (
    <>
      {nodeDetail && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: 16,
            zIndex: 10,
            minWidth: 260,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>
            {nodeDetail.speaker}（{nodeDetail.type}）
          </div>
          <div style={{ fontSize: 14, color: "#333" }}>
            {nodeDetail.utterance}
          </div>
          <button
            style={{
              marginTop: 10,
              background: "#eee",
              border: "none",
              borderRadius: 4,
              padding: "4px 12px",
              cursor: "pointer",
            }}
            onClick={() => setSelectedNode(null)}
          >
            閉じる
          </button>
        </div>
      )}
    </>
  );
}

export default App;
