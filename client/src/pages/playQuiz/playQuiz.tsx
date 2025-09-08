import { useNavigate, useParams } from "react-router";
import Footer from "../../components/footer/footer";
import Nav from "../../components/nav/nav";
import "./playQuiz.scss";
import { useEffect, useState } from "react";
import api from "../../api";
import { Level } from "../../types";

function PlayQuiz(){
    const {levelId} = useParams<{levelId: string}>();
    const navigate = useNavigate();
    const [quizContent, setQuizContent] = useState<string>('');
    const [level, setLevel] = useState<Level>();
    useEffect(()=>{
        (async()=>{
            const level = await api.get<Level>(`/getLevel/${levelId}`);
            if(Number(level.data.type)==0){
                navigate(`/viewTheory/${levelId}`);
            }
            setLevel(level.data);
        })();
    });
    return (
        <>
            <Nav />
            <div id="playQuiz">

            </div>
            <Footer />
        </>
    );
}

export default PlayQuiz;