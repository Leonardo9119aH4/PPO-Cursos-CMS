import { useNavigate, useParams } from "react-router";
import Footer from "../../components/footer/footer";
import Nav from "../../components/nav/nav";
import "./playLevels.scss";
import { useEffect, useState } from "react";
import { Course, Level } from "../../types";
import api from "../../api";
import { Link } from "react-router-dom";
import levelImg from "../../assets/level.png";

function PlayLevels(){
    const {courseId} = useParams<{courseId: string}>();
    const [playLevels, setPlayLevels] = useState<Level[]>();
    const navigate = useNavigate();
    useEffect(()=>{
        (async()=>{
            try{
                const course = await api.get<Course>(`/getCourse/${courseId}`);
                setPlayLevels(course.data.levels);
            }
            catch(er: any){
                // if(er.response.status == 404 || er.response.status == 403){
                //     navigate("/courses");
                // }
                // if(er.response.status == 401){
                //     navigate("/signin");
                // }
            }
        })();
    }, [courseId]);
    
    return (
        <>
            <Nav />
            <div id="play-levels">
                <main>
                    <div id="levels">
                    <ul>
                    {playLevels?.map((level, i)=>(
                        <li key={i}>
                            <Link to={`${Number(level.type) === 1 ? "/playQuiz" : "/viewTheory"}/${level.id}`}>{i}</Link>
                        </li>
                    ))}
                    </ul>
                    </div>
                    <div id="game">
                        <div id="lifes">
                            <h1>5</h1>
                            <Link to="/">PRATICAR</Link>
                        </div>
                        <div id="rank">

                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default PlayLevels;