import dagre from "dagre";
import type { Edge } from "@xyflow/react";
import type { PersonNode } from "./store";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 150;

export const getLayoutedElements = (nodes: PersonNode[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 100 });

  // First, identify all partner groups to create dummy nodes for them
  const partnerEdges = edges.filter(e => e.type === "straight");
  const childEdges = edges.filter(e => e.type !== "straight");
  
  // Create a map to find which dummy node a person belongs to
  const personToDummyMap = new Map<string, string>();
  const dummyNodes = new Set<string>();

  // Assign dummy nodes for partnered pairs
  partnerEdges.forEach((edge, index) => {
    const dummyId = `dummy_partner_${index}`;
    dummyNodes.add(dummyId);
    personToDummyMap.set(edge.source, dummyId);
    personToDummyMap.set(edge.target, dummyId);
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add dummy nodes to graph
  dummyNodes.forEach(dummyId => {
    dagreGraph.setNode(dummyId, { width: 0, height: 0 });
  });

  // Link partners to their dummy nodes
  partnerEdges.forEach((edge) => {
    const dummyId = personToDummyMap.get(edge.source)!;
    // Connect both partners to the dummy node to keep them on the same rank
    dagreGraph.setEdge(edge.source, dummyId, { minlen: 1, weight: 10 });
    dagreGraph.setEdge(edge.target, dummyId, { minlen: 1, weight: 10 });
  });

  // Link children from dummy nodes (if parents are partnered) or directly
  childEdges.forEach((edge) => {
    const sourceDummyId = personToDummyMap.get(edge.source);
    if (sourceDummyId) {
       // Only add edge from dummy to target if we haven't already (prevent duplicates if both parents link to same child)
       if (!dagreGraph.hasEdge(sourceDummyId, edge.target)) {
           dagreGraph.setEdge(sourceDummyId, edge.target, { minlen: 1, weight: 1 });
       }
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
