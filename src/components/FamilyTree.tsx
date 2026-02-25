import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LayoutTemplate, Plus, RotateCcw } from "lucide-react";
import { useStore } from "../lib/store";
import { PersonNode } from "./PersonNode";
import { getLayoutedElements } from "../lib/layout";

const nodeTypes: NodeTypes = {
  person: PersonNode,
};

export function FamilyTree() {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const addPerson = useStore((state) => state.addPerson);
  const setNodesAndEdges = useStore((state) => state.setNodesAndEdges);
  const resetTree = useStore((state) => state.resetTree);

  const { fitView } = useReactFlow();
  const [isLayouting, setIsLayouting] = useState(false);

  // Initialize nodes if empty
  useEffect(() => {
    if (nodes.length === 0) {
      resetTree();
    }
  }, [nodes.length, resetTree]);

  const onLayout = useCallback(
    () => {
      if (nodes.length === 0) return;
      setIsLayouting(true);
      
      setTimeout(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          nodes,
          edges
        );
        setNodesAndEdges(layoutedNodes, layoutedEdges);
        
        setTimeout(() => {
          fitView({ duration: 800, padding: 0.2 });
          setIsLayouting(false);
        }, 50);
      }, 50);
    },
    [nodes, edges, setNodesAndEdges, fitView]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ 
          type: "smoothstep", 
          animated: false,
          style: { strokeWidth: 2 } 
        }}
      >
        <Background gap={24} size={2} color="#e2e8f0" />
        <Controls 
          className="bg-white shadow-lg border-none rounded-xl overflow-hidden" 
          showInteractive={false}
        />
        <MiniMap 
          className="bg-white shadow-lg border border-slate-200 rounded-xl"
          nodeColor="#e2e8f0"
          maskColor="rgba(248, 250, 252, 0.7)"
        />

        <Panel position="top-left" className="m-4">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Lineage</h1>
            <p className="text-xs text-slate-500">Local-first family tree</p>
          </div>
        </Panel>

        <Panel position="top-right" className="m-4">
          <div className="flex gap-2">
            <button
              onClick={() => onLayout()}
              disabled={isLayouting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all text-slate-700 text-sm font-medium disabled:opacity-50"
            >
              <LayoutTemplate size={16} className={isLayouting ? "animate-pulse" : ""} />
              Auto-Layout
            </button>
            <button
              onClick={() => resetTree()}
              className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:text-red-600 transition-all text-slate-400"
              title="Reset to Dummy Data"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </Panel>

        <Panel position="bottom-center" className="mb-8">
          <button
            onClick={() => addPerson()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium"
          >
            <Plus size={18} />
            Add Person
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
