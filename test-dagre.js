import dagre from "dagre";
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 100 });
dagreGraph.setNode("A", { width: 250, height: 150 });
dagreGraph.setNode("B", { width: 250, height: 150 });
dagreGraph.setNode("C", { width: 250, height: 150 });
dagreGraph.setNode("dummy", { width: 0, height: 0 });

dagreGraph.setEdge("A", "dummy", { minlen: 1, weight: 10 });
dagreGraph.setEdge("B", "dummy", { minlen: 1, weight: 10 });
dagreGraph.setEdge("A", "C", { minlen: 1, weight: 1 });

dagre.layout(dagreGraph);
console.log("A X:", dagreGraph.node("A").x, "Y:", dagreGraph.node("A").y);
console.log("B X:", dagreGraph.node("B").x, "Y:", dagreGraph.node("B").y);
console.log("C X:", dagreGraph.node("C").x, "Y:", dagreGraph.node("C").y);
console.log("dummy X:", dagreGraph.node("dummy").x, "Y:", dagreGraph.node("dummy").y);
