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
    const [correctCount, setCorrectCount] = useState<number>(0);
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
            // increment correct counter
            setCorrectCount(prev => prev + 1);
            if(questions[currentQuestion+1]){
                setCurrentQuestion(currentQuestion+1);
            }
            else{
                // Quiz finished - compute XP and send to server
                const K = questions.length || 1;
                const finalCorrect = correctCount + 1; // include this last correct
                const scorePercent = (finalCorrect / K) * 100;
                const Sec = time;

                const computeExp = (K: number, Sec: number, score: number) =>{
                    // Formula: exp = 100 - (K/5) * ( ln(Sec/100) / ln(score/100) )
                    // Handle edge cases: score==100 (ln=0), score<=0, Sec<=0
                    if(score <= 0) return 0;
                    if(score >= 100) return 100;
                    const num = Math.log(Sec/100);
                    const den = Math.log(score/100);
                    if(!isFinite(num) || !isFinite(den) || den === 0) return 100;
                    const val = 100 - (K/5) * (num / den);
                    if(!isFinite(val) || isNaN(val)) return 0;
                    return Math.max(0, Math.round(val));
                }

                const exp = computeExp(K, Sec, scorePercent);
                try{ if(level?.courseId) api.post(`/addxp/${level.courseId}`, { xp: exp }); }catch(e){console.error(e)}
                alert(`Parabéns, você venceu! XP ganho: ${exp}`);
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