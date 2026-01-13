import "./Menu.css";
import { StaticEditableInput } from "../../controls/static-editable-input/StaticEditableInput";

export interface MenuItem {
  title: string;
  icon?: string;
}

export interface MenuGrouping {
  title: string;
  items: MenuItem[];
}

export type MenuOptions = (MenuItem | MenuGrouping)[];

interface MenuProps {
  navItems: MenuOptions;
}

export default function Menu({ navItems }: MenuProps) {
  return (
    <div className="outer-menu-container flex w-full h-full shadow-md flex-col">
      <Header />
      {/* <Body navItems={navItems} /> */}
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

function Body({ navItems }: MenuProps) {
  return (
    <div className="w-full shadow-md bg-white rounded-md flex-auto">
      <div className="menu-container border-r-neutral-300 w-full flex flex-col">
        <div className="p-4">
          {navItems.map((item) => {
            if ((item as MenuGrouping)?.items) {
              return GroupedMenuItem(item as MenuGrouping);
            } else {
              return MenuItem(item as MenuItem);
            }
          })}
        </div>
      </div>
    </div>
  );
}

function GroupedMenuItem({ title, items }: MenuGrouping) {
  return (
    <div key={title} className="py-2">
      <div className="text-xs font-bold tracking-wide">{title}</div>
      <div>{items.map((item) => MenuItem(item))}</div>
    </div>
  );
}

function MenuItem(item: MenuItem) {
  return (
    <div
      className="px-2 py-1 cursor-pointer my-1 font-medium text-neutral-900 hover:bg-neutral-100 rounded-lg"
      key={item.title}
    >
      {item.title}
    </div>
  );
}
