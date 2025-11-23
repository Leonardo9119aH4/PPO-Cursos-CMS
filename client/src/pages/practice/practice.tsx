import { useNavigate, useParams } from "react-router";
import Footer from '../../components/footer/footer';
import Nav from '../../components/nav/nav';
import './practice.scss';
import { useEffect, useState } from "react";
import api from "../../api";
import { QuizContent } from "../../types";

function Practice(){
    const params = useParams<{courseId?: string}>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<QuizContent[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [courseId, setCourseId] = useState<number | undefined>(undefined);
    const [time, setTime] = useState<number>(0); // Tempo em segundos

    useEffect(()=>{
        (async()=>{
            try{
                const routeCourseId = params.courseId as string | undefined;
                if(!routeCourseId) return;
                const cId = Number(routeCourseId);
                if(isNaN(cId)) return;
                setCourseId(cId);
                const practiceResp = await api.get<QuizContent[]>(`/getPractice/${cId}`);
                setQuestions(practiceResp.data || []);
            }
            catch(er){
                console.error(er);
            }
        })();
    }, [params.courseId, navigate]);

    useEffect(()=>{ // Cronômetro
        const timer = setInterval(()=>{
            setTime(prev => prev+1);
        }, 1000);
        return ()=>clearInterval(timer);
    }, []);

    const userAnswer = (userAlt: number)=>{
        const q = questions[currentQuestion];
        if(!q) return;
        if(userAlt === q.answer){
            if(questions[currentQuestion+1]){
                setCurrentQuestion(currentQuestion+1);
            }
            else{
                alert("Parabéns, você venceu!");
                if(courseId){
                    api.post(`/finishPractice/${courseId}`);
                    navigate(`/playLevels/${courseId}`);
                }
                else{
                    navigate(`/playLevels/0`);
                }
            }
        }
        else{
            // Sem penalizações por erro em modo de prática
            alert("Errou!");
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
            <div id="practice">
                <header>
                    <div className="question">
                        <h1 id="question-number">{currentQuestion+1}. </h1>
                        <h1 id="question-enunciation">{questions[currentQuestion]?.enunciation}</h1>
                    </div>
                    <div className="playing">
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

export default Practice;
