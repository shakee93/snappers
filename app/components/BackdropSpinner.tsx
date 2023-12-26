import {Loader} from "lucide-react";


const BackdropSpinner = () => {


    return <div className='absolute flex items-center justify-center inset-0 bg-gray-300/50 backdrop-blur-md z-[150] rounded-2xl'>
        <Loader className='animate-spin'/>
    </div>
}

export default BackdropSpinner