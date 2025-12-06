export interface Position {
    x: number;
    y: number;
}

type handlerFn = (e?: MouseEvent) => void;

export class DragAndDrop<T extends HTMLElement = HTMLElement> {

    private readonly _elem: T;
    private readonly _onDragFN: handlerFn;
    private readonly _onDropFN: handlerFn;
    public done: () => void;

    constructor(
        elem: T, 
        onDragFN: handlerFn,
        onDropFN: handlerFn
    ) {
        this._elem = elem;
        this._onDragFN = onDragFN;
        this._onDropFN = onDropFN;

        this.done = this._init();
    }


    private _init(): () => void {
        const dragging = () => {
            this._onDragFN();
            this._elem.addEventListener(
                'mousemove',
                this._onDragFN
            );

            this._elem.addEventListener(
                'mouseup',
                () => {
                    this._onDropFN();
                    this._elem.removeEventListener('mousemove', this._onDragFN)
                },
                {
                    once: true
                }
            );
        };

        this._elem.addEventListener(
            'mousedown', 
            dragging,
        );

        return () => {
                    this._elem.addEventListener(
            'mousedown', 
            dragging,
        );
        }

    }

}