import {Diameter, MemoryStick, PaintBucket, Ratio} from "lucide-react";
import {Maybe} from "@/graphql/types/graphql";

const AttributeIcon = ({ name, className} : { name?: string | Maybe<string>, className?: string}) => {
    return  <>
        {name === 'pa_capacity' && <MemoryStick className={className}/>}
        {(name === 'pa_color' || name === 'pa_colour') && <PaintBucket className={className}/>}
        {(name === 'pa_watch-size') && <Ratio className={className}/>}
        {!name && <Diameter className={className}/>}

    </>
}

export default AttributeIcon