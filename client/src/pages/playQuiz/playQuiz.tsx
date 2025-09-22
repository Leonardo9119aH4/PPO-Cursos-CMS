import { useNavigate, useParams } from "react-router";
import Footer from "../../components/footer/footer";
import Nav from "../../components/nav/nav";
import "./playQuiz.scss";
import { useEffect, useState } from "react";
import api from "../../api";
import { Level, Studying } from "../../types";

function PlayQuiz(){
    const {levelId} = useParams<{levelId: string}>();
    const navigate = useNavigate();
    const [quizContent, setQuizContent] = useState<string>('');
    const [level, setLevel] = useState<Level>();
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [lifes, setLifes] = useState<number>(1);
    const questions = Array.isArray(level?.content) ? level.content : [];
    useEffect(()=>{
        (async()=>{
            const level = await api.get<Level>(`/getLevel/${levelId}`);
            if(Number(level.data.type)==0){
                navigate(`/viewTheory/${levelId}`);
            }
            console.log(level)
            const studying = await api.get<Studying>(`/getStudying/${level.data.courseId}`);
            if(studying.data.lifes <= 0){
                navigate(`/playLevels/${level.data.courseId}`);
            }
            setLifes(studying.data.lifes);
            setLevel(level.data);
        })();
    }, []);
    const userAnswer = (userAlt: number)=>{
        if(userAlt === questions[currentQuestion].answer){
            setCurrentQuestion(currentQuestion+1);
        }
        else{
            setLifes(lifes-1);
            
            if(lifes<=0){
                alert("Fim de jogo!");
            }
            else{
                alert("Errou!");
            }
        }
    }
    return (
        <>
            <Nav />
            <div id="playQuiz">
                <header>
                    <h1 id="question-number">{currentQuestion+1}</h1>
                    <h1 id="question-enunciation">{questions[currentQuestion]?.enunciation}</h1>
                    <h1>{lifes}</h1>
                </header>
                <main>
                    {questions[currentQuestion]?.alternatives?.map((alt, i)=>(
                        <button onClick={()=>userAnswer(i)} key={i}>{alt}</button>
                    ))}
                </main>
            </div>
            <Footer />
        </>
    );
}

export default PlayQuiz;