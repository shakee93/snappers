import {useRouter} from "next/navigation";
import {useEffect} from "react";


const RouterLoader = () => {

    const router = useRouter()

    useEffect(() => {


    }, []);

    return <div>
        loading...
    </div>
}

export default RouterLoader