import type { Dimensions } from '../../../reducers/navigator';
import './Navigator.css'

interface NavigatorProps {
    nodeAreaDims: Dimensions;
}

export default function Navigator({nodeAreaDims: {height, width}}: NavigatorProps) {


    const scaleVal = 0.15;

    return <div style={
            {
            height: height * scaleVal,
            width: width * scaleVal
            }
        } className="navigator flex shadow-xl bg-neutral-50 p-1 rounded-lg">
        <div className='flex-1 w-full h-full bg-neutral-300 rounded-lg'>

        </div>
    </div>
}