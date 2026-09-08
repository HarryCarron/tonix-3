import "./Menu.css";
import { StaticEditableInput } from "../../controls/static-editable-input/StaticEditableInput";

export default function Menu() {
  return (
    <div className="outer-menu-container flex w-full h-full shadow-md flex-col">
      <Header />
    </div>
  );
}

function Header() {
  return (
    <div className="w-full bg-white p-4 mb-4">
      <div className="header text-4xl mb-2 flex items-center font-bold">
        <span className="highlight relative">Tonix</span>
        <span></span>
      </div>
      <div>
        <StaticEditableInput value="Blank Project" onChange={() => {}} />
      </div>
    </div>
  );
}
