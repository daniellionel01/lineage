import "./index.css";
import { ReactFlowProvider } from "@xyflow/react";
import { FamilyTree } from "./components/FamilyTree";

export function App() {
  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <FamilyTree />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
