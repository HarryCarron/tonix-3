import "./App.css";
import Menu from "./components/editor/menu/Menu";
import { menuItems } from "./components/editor/menu/menu-items";
import { Workspace } from "./components/editor/workspace/Workspace";

function App() {
  return (
    <div className="flex h-full flex">
      <div className="w-80">
        <Menu navItems={menuItems} />
      </div>
      <div className="flex-1 min-w-0">
        <Workspace />
      </div>
    </div>
  );
}

export default App;
