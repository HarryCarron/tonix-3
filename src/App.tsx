import "./App.css";
import Menu from "./components/editor/menu/Menu";
import { menuItems } from "./components/editor/menu/menu-items";
import { Workspace } from "./components/editor/workspace/Workspace";
import { useState } from "react";
import type { EditorTool } from "./types/editor/EditorTools";

function App() {
  const [editorTool, setEditorTool] = useState<EditorTool>();

  return (
    <div className="flex h-full flex">
      <div className="w-100">
        <Menu navItems={menuItems} />
      </div>
      <div className="flex-1 min-w-0">
        <Workspace editorTool={editorTool!} />
      </div>
    </div>
  );
}

export default App;
