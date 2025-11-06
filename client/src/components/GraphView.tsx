import { useEffect, useState } from "react";
import { useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import { MultiDirectedGraph } from "graphology";
import { useWorkerLayoutForce } from "@react-sigma/layout-force";

export type MapNode = {
  id: string;
  label: string;
  type: string;
  speaker: string;
  utterance: string;
};

export type MapEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
};

type GraphViewProps = {
  nodes?: MapNode[];
  edges?: MapEdge[];
  onNodeClick?: (node: MapNode) => void;
};

const LayoutForce: React.FC = () => {
  const { start, kill } = useWorkerLayoutForce({
    settings: {
      attraction: 0.002,
      repulsion: 0.3,
      gravity: 0.002,
      inertia: 0.0,
      maxMove: 10,
    },
  });

  useEffect(() => {
    try {
      start();
    } catch (error) {
      console.error("Error starting force layout:", error);
    }

    return () => {
      try {
        console.log("kill FA2");
        kill();
      } catch (error) {
        console.error("Error killing force layout:", error);
      }
    };
  }, [start, kill]);

  return null;
};

const GraphView = ({ nodes, edges, onNodeClick }: GraphViewProps) => {
  const loadGraph = useLoadGraph();
  const [nodeMap, setNodeMap] = useState<{ [id: string]: MapNode }>({});
  const sigma = useSigma();

  // ノードドラッグ用イベント
  useEffect(() => {
    if (!sigma) return;
    let draggingNode: string | null = null;
    let offset = { x: 0, y: 0 };

    const handleDown = (event: MouseEvent) => {
      const pos = sigma.viewportToGraph({
        x: event.offsetX,
        y: event.offsetY,
      });
      let foundNode: string | null = null;
      sigma.getGraph().forEachNode((key, attr) => {
        const dx = attr.x - pos.x;
        const dy = attr.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (attr.size || 10)) {
          foundNode = key;
        }
      });
      if (foundNode) {
        draggingNode = foundNode;
        const nodeAttr = sigma.getGraph().getNodeAttributes(foundNode);
        offset = { x: nodeAttr.x - pos.x, y: nodeAttr.y - pos.y };
        // マウスキャプチャ不要
      }
    };

    const handleMove = (event: MouseEvent) => {
      if (!draggingNode) return;
      const pos = sigma.viewportToGraph({
        x: event.offsetX,
        y: event.offsetY,
      });
      sigma.getGraph().setNodeAttribute(draggingNode, "x", pos.x + offset.x);
      sigma.getGraph().setNodeAttribute(draggingNode, "y", pos.y + offset.y);
    };

    const handleUp = () => {
      draggingNode = null;
      // マウスキャプチャ不要
    };

    const container = sigma.getContainer();
    container.addEventListener("mousedown", handleDown);
    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseup", handleUp);

    return () => {
      container.removeEventListener("mousedown", handleDown);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseup", handleUp);
    };
  }, [sigma]);

  useEffect(() => {
    if (!nodes || !edges) return;
    const graph = new MultiDirectedGraph();
    const getRandomPosition = (scale = 200) => ({
      x: Math.random() * scale - scale / 2,
      y: Math.random() * scale - scale / 2,
    });

    const map: { [id: string]: MapNode } = {};
    nodes.forEach((n) => {
      map[n.id] = n;
      if (!graph.hasNode(n.id)) {
        const { x, y } = getRandomPosition();
        // ノードの次数（接続された辺の数）を計算
        const degree =
          edges?.filter((e) => e.source === n.id || e.target === n.id).length ||
          0;
        // 最小サイズ18、最大サイズ40程度でスケーリング
        const size = Math.max(18, Math.min(40, 18 + degree * 4));
        graph.addNode(n.id, {
          label: n.speaker ? `${n.speaker}: ${n.label}` : n.label,
          color:
            n.type === "topic"
              ? "#ff9800"
              : n.type === "person"
              ? "#43a047"
              : "#1976d2",
          size,
          borderColor: n.type === "topic" ? "#ffa726" : "#90caf9",
          borderWidth: n.type === "topic" ? 4 : 2,
          speaker: n.speaker,
          utterance: n.utterance,
          x,
          y,
          zIndex: n.type === "topic" ? 2 : 1,
        });
      }
    });
    setNodeMap(map);
    edges.forEach((e) => {
      const label =
        e.type === "agree" ? "賛成" : e.type === "disagree" ? "反対" : "質問";
      if (
        graph.hasNode(e.source) &&
        graph.hasNode(e.target) &&
        !graph.hasEdge(e.id)
      ) {
        graph.addEdgeWithKey(e.id, e.source, e.target, {
          size: 5,
          color: "#90caf9",
          type: "arrow",
          label,
        });
      }
    });
    loadGraph(graph);
  }, [nodes, edges, loadGraph, setNodeMap]);

  const registerEvents = useRegisterEvents();

  useEffect(() => {
    if (!registerEvents) return;
    registerEvents({
      clickNode: (e: { node: string }) => {
        if (
          onNodeClick &&
          nodeMap &&
          typeof e.node !== "undefined" &&
          nodeMap &&
          Object.prototype.hasOwnProperty.call(nodeMap, e.node) &&
          nodeMap[e.node] !== undefined
        ) {
          onNodeClick(nodeMap[e.node] as MapNode);
        }
      },
    });
  }, [registerEvents, onNodeClick, nodeMap]);

  return <LayoutForce />;
};

export default GraphView;
