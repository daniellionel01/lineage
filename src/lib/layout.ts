import dagre from "dagre";
import type { Edge } from "@xyflow/react";
import type { PersonNode } from "./store";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 150;

export const getLayoutedElements = (nodes: PersonNode[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    // Treat partners as on the same rank
    if (edge.type === "straight") {
        dagreGraph.setEdge(edge.source, edge.target, { minlen: 1, weight: 10 });
    } else {
        dagreGraph.setEdge(edge.source, edge.target, { minlen: 1, weight: 1 });
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
