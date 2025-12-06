import './App.css';
import Tools from './components/editor/tools/Tools';
import Navigator from './components/editor/navigator/Navigator';
// import { NodesArea } from './components/editor/node-area/NodeArea';
import { useState, useRef, useEffect, useReducer } from 'react';
import { DragAndDrop } from './utils/drag-and-drop';
import { navigation } from './reducers/navigator';
import Menu from './components/editor/menu/Menu';
import { menuItems } from './components/editor/menu/menu-items';


function App() {

  const [isDragging, setIsDragging] = useState(false);

  const [state, dispatch] = useReducer(navigation, {nodeAreaDims: {width: 1, height: 1}});

  const nodesArea = useRef<HTMLSpanElement | null>(null);
  const body = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // const ddRef = new DragAndDrop<HTMLDivElement>(
    //   nodesArea.current as HTMLDivElement,
    //   () => {
    //     setIsDragging(true);
    //   },
    //   () => {
    //     setIsDragging(false);
    //   },
    // );
    // return () => {
    //   ddRef.done();
    // }
  }, [])


  useEffect(() => {
    if (!body.current) return;
    const resize = new ResizeObserver((entries) => {

        const { width, height } = entries[0].contentRect;

        dispatch({
          type: 'setNodeAreaDims',
          payload: {
            width,
            height
          }
        })

      });

      resize.observe(body.current as HTMLDivElement);

      return () => resize.disconnect();
    }, []);

  const classes = `nodes-container relative flex-1 bg-neutral-100 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} `

  return (
    <div className="flex h-full">
      <div className="menu-container w-xs">
        <Menu navItems={ menuItems }/>
      </div>
      <div ref={body} className={classes}>

        {/* <span ref={nodesArea}>
          <NodesArea/>
        </span> */}

        <span className="tools-container absolute m-4">
          <Tools/>
        </span>

        <span className="navigator-container absolute m-4">
          <Navigator nodeAreaDims={state.nodeAreaDims}/>
        </span>

      </div>
    </div>
  )
}

export default App