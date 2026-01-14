import { EditorTool } from "@/types/editor/EditorTools";
import { HandRaisedIcon } from "@heroicons/react/16/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { PlusIcon } from "@heroicons/react/16/solid";
import type { Dispatch, SetStateAction } from "react";

interface ToolsProps {
  editorTool: EditorTool;
  setEditorTool: Dispatch<SetStateAction<EditorTool | undefined>>;
}

export default function Tools({ editorTool, setEditorTool }: ToolsProps) {
  const baseClass = "p-4 rounded-lg active:bg-stone-200 cursor-pointer ";

  const classes = {
    pan:
      editorTool === EditorTool.pan
        ? "border border-stone-400"
        : "hover:bg-stone-100",
    mag:
      editorTool === EditorTool.mag
        ? " border border-stone-400"
        : "hover:bg-stone-100",
  };

  return (
    <div className="bg-stone-50 p-2 flex rounded-lg shadow-xl gap-2 border border-stone-600">
      <button
        onClick={() => setEditorTool(EditorTool.add)}
        className={baseClass}
      >
        <PlusIcon className="size-6 text-stone-800" />
      </button>
      <button
        onClick={() => setEditorTool(EditorTool.pan)}
        className={baseClass + classes.pan}
      >
        <HandRaisedIcon className="size-6 text-stone-800" />
      </button>
      <button
        onClick={() => setEditorTool(EditorTool.mag)}
        className={baseClass + classes.mag}
      >
        <MagnifyingGlassIcon className="size-6 text-stone-800" />
      </button>
    </div>
  );
}
