import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { MultiDirectedGraph } from "graphology";
import { useEffect } from "react";
import type { CSSProperties, FC } from "react";

const MyGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new MultiDirectedGraph();
    graph.addNode("A", { x: 0, y: 0, label: "Node A", size: 10 });
    graph.addNode("B", { x: 1, y: 1, label: "Node B", size: 10 });
    graph.addEdgeWithKey("rel1", "A", "B", { label: "REL_1" });
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

const App2: FC<{ style?: CSSProperties }> = ({ style }) => {
  return (
    <SigmaContainer style={style}>
      <MyGraph />
    </SigmaContainer>
  );
};

export default App2;
