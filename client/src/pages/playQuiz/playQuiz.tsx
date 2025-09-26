import { useNavigate, useParams } from "react-router";
import Footer from "../../components/footer/footer";
import Nav from "../../components/nav/nav";
import "./playQuiz.scss";
import { use, useEffect, useState } from "react";
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
    const [time, setTime] = useState<number>(0); // Tempo em segundos
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
    useEffect(()=>{ // Cronômetro
        const timer = setInterval(()=>{
            setTime(prev => prev+1);
        }, 1000);
        return ()=>clearInterval(timer);
    }, []);
    const userAnswer = (userAlt: number)=>{
        if(userAlt === questions[currentQuestion].answer){
            if(questions[currentQuestion+1]){
                setCurrentQuestion(currentQuestion+1);
            }
            else{
                alert("Parabéns, você venceu!");
                api.post(`/levelUp/${level?.courseId}/${levelId}`);
                navigate(`/playLevels/${level?.courseId}`);
            }
        }
        else{
            setLifes(lifes-1);
            api.post(`/wrongAnswer/${levelId}/${currentQuestion}`);
            if(lifes<=0){
                alert("Fim de jogo!");
                navigate(`/playLevels/${level?.courseId}`);
            }
            else{
                alert("Errou!");
            }
        }
    }
    const formatTime = (time: number)=>{
        const min = Math.floor(time/60);
        const sec = time%60;
        if(sec<=9 && min<=9){
            return `0${min}:0${sec}`;
        }
        if(min<=9){
            return `0${min}:${sec}`;
        }
        if(sec<=9){
            return `${min}:0${sec}`;
        }
        return `${min}:${sec}`;
    }
    return (
        <>
            <Nav />
            <div id="playQuiz">
                <header>
                    <div className="question">
                        <h1 id="question-number">{currentQuestion+1}. </h1>
                        <h1 id="question-enunciation">{questions[currentQuestion]?.enunciation}</h1>
                    </div>
                    <div className="playing">
                        <h1 id="lifes">{lifes}</h1>
                        <h1 id="timer">{formatTime(time)}</h1>
                    </div>
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