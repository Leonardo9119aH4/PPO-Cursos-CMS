import "./sideLevels.scss";
import { Link } from "react-router-dom";

function SideLevels({courseId, order, type}: any){
    return(
        <div className="side-levels">
            <div id="sideLevels"><Link to={`/theoryEditor/${courseId}/${Number(order) - 1}`}>←</Link>Nível {order}<Link to={`/theoryEditor/${courseId}/${Number(order) + 1}`}>→</Link></div> 
            <p>{type}</p> {/* Melhorar (prequiça é osso) */}
        </div>
    )
}

export default SideLevels;