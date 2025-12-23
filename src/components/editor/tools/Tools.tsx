import { HandRaisedIcon } from "@heroicons/react/16/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { PlusIcon } from "@heroicons/react/16/solid";

export default function Tools() {
  return (
    <div className="bg-strone-50 p-1 rounded-lg shadow-xl">
      <button className="p-4 rounded-lg hover:bg-stone-100 active:bg-strone-200 cursor-pointer">
        <PlusIcon className="size-6" />
      </button>
      <button className="p-4 rounded-lg hover:bg-strone-100 active:bg-strone-200 cursor-pointer">
        <HandRaisedIcon className="size-6" />
      </button>
      <button className="p-4 rounded-lg hover:bg-strone-100 active:bg-strone-200 cursor-pointer">
        <MagnifyingGlassIcon className="size-6" />
      </button>
    </div>
  );
}
