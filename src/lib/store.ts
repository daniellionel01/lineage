import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";

export type PersonData = {
  name: string;
  birth: string;
  death: string;
  gender?: "male" | "female" | "other";
};

export type PersonNode = Node<PersonData, "person">;

export type FamilyStore = {
  nodes: PersonNode[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<PersonNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addPerson: (data?: Partial<PersonData>) => void;
  updatePerson: (id: string, data: Partial<PersonData>) => void;
  deletePerson: (id: string) => void;
  addChild: (parentId: string) => void;
  addPartner: (partnerId: string) => void;
  setNodesAndEdges: (nodes: PersonNode[], edges: Edge[]) => void;
  resetTree: () => void;
};

const initialNodes: PersonNode[] = [
  {
    id: "g1-1",
    type: "person",
    position: { x: 0, y: 0 },
    data: { name: "Arthur Pendragon", birth: "1890", death: "1960", gender: "male" },
  },
  {
    id: "g1-2",
    type: "person",
    position: { x: 300, y: 0 },
    data: { name: "Eleanor Vance", birth: "1895", death: "1975", gender: "female" },
  },
  {
    id: "g2-1",
    type: "person",
    position: { x: 150, y: 200 },
    data: { name: "William Pendragon", birth: "1920", death: "1995", gender: "male" },
  },
  {
    id: "g2-2",
    type: "person",
    position: { x: 450, y: 200 },
    data: { name: "Sarah Jenkins", birth: "1922", death: "2010", gender: "female" },
  },
  {
    id: "g3-1",
    type: "person",
    position: { x: 300, y: 400 },
    data: { name: "James Pendragon", birth: "1950", death: "", gender: "male" },
  },
];

const initialEdges: Edge[] = [
  { id: "e-g1-partner", source: "g1-1", target: "g1-2", type: "straight", animated: true },
  { id: "e-g1-to-g2", source: "g1-1", target: "g2-1", type: "smoothstep" },
  { id: "e-g1-2-to-g2", source: "g1-2", target: "g2-1", type: "smoothstep" },
  { id: "e-g2-partner", source: "g2-1", target: "g2-2", type: "straight", animated: true },
  { id: "e-g2-to-g3", source: "g2-1", target: "g3-1", type: "smoothstep" },
  { id: "e-g2-2-to-g3", source: "g2-2", target: "g3-1", type: "smoothstep" },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) as PersonNode[] });
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (connection) => {
        set({ edges: addEdge({ ...connection, type: "smoothstep" }, get().edges) });
      },

      addPerson: (data) => {
        const id = generateId();
        const newNode: PersonNode = {
          id,
          type: "person",
          position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 },
          data: { name: "New Person", birth: "", death: "", ...data },
        };
        set({ nodes: [...get().nodes, newNode] });
      },

      updatePerson: (id, data) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === id) {
              return { ...node, data: { ...node.data, ...data } };
            }
            return node;
          }),
        });
      },

      deletePerson: (id) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== id),
          edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
        });
      },

      addChild: (parentId) => {
        const childId = generateId();
        const parentNode = get().nodes.find((n) => n.id === parentId);
        
        const newNode: PersonNode = {
          id: childId,
          type: "person",
          position: { 
            x: parentNode ? parentNode.position.x : 0, 
            y: parentNode ? parentNode.position.y + 200 : 0 
          },
          data: { name: "", birth: "", death: "" },
        };

        const newEdge: Edge = {
          id: `e-${parentId}-${childId}`,
          source: parentId,
          target: childId,
          type: "smoothstep",
        };

        set({
          nodes: [...get().nodes, newNode],
          edges: [...get().edges, newEdge],
        });
      },

      addPartner: (partnerId) => {
        const newPartnerId = generateId();
        const existingPartner = get().nodes.find((n) => n.id === partnerId);
        
        const newNode: PersonNode = {
          id: newPartnerId,
          type: "person",
          position: { 
            x: existingPartner ? existingPartner.position.x + 300 : 0, 
            y: existingPartner ? existingPartner.position.y : 0 
          },
          data: { name: "", birth: "", death: "" },
        };

        const newEdge: Edge = {
          id: `e-${partnerId}-${newPartnerId}`,
          source: partnerId,
          target: newPartnerId,
          type: "straight",
          animated: true,
        };

        set({
          nodes: [...get().nodes, newNode],
          edges: [...get().edges, newEdge],
        });
      },

      setNodesAndEdges: (nodes, edges) => {
        set({ nodes, edges });
      },
      
      resetTree: () => {
        set({ nodes: initialNodes, edges: initialEdges });
      }
    }),
    {
      name: "lineage-storage",
    }
  )
);
