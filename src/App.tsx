import "./App.css";
import Tools from "./components/editor/tools/Tools";
import Menu from "./components/editor/menu/Menu";
import { menuItems } from "./components/editor/menu/menu-items";
import { Workspace } from "./components/editor/workspace/Workspace";
import { useState } from "react";
import type { EditorTool } from "./types/editor/EditorTools";

function App() {
  const [editorTool, setEditorTool] = useState<EditorTool>();

  return (
    <div className="flex h-full relative">
      <div className="menu-container absolute z-10 w-sm h-full">
        <Menu navItems={menuItems} />
      </div>
      <Workspace editorTool={editorTool!} />

      <div className="absolute tools-container flex justify-center w-full p-5">
        <Tools editorTool={editorTool!} setEditorTool={setEditorTool} />
      </div>
    </div>
  );
}

export default App;
