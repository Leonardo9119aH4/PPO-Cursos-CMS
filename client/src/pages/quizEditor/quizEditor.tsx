import "./quizEditor.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import SideLevels from "../../components/sideLevels/sideLevels";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../../api";
import { Level, Question } from "../../types";
import closeIcon from "../../assets/close_icon.svg";

function QuizEditor(){
    const {courseId, order} = useParams<{courseId: string; order: string}>();
    const [quizContent, setQuizContent] = useState(false);
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>();

    const downloadFromServer = async()=>{
        try{
            const level = await api.get<Level>(`/getleveltoedit/${courseId}/${order}`);
            if(level.data == null || level.data == undefined){
                navigate(`/courseEditor/${courseId}`);
            }
            if(Number(level.data.type) == 0){ //VS Code burro
                navigate(`/theoryEditor/${courseId}/${order}`);
            }
            setQuestions(level.data.content as Question[]);
        }
        catch(er: any){
            if(er.response.status == 401){
                navigate("/signin");
            }
            if(er.response.status == 404){
                navigate("/myCourses")
            }
        }
    }
    const saveToServer = ()=>{
        const questionsToSave = questions?.map(q => ({
            ...q,
            alternatives: [...q.alternatives],
        }));
        api.post(`/saveLevel/${courseId}/${order}`, questionsToSave).catch((er)=>{
            console.log(er.response.data);
        });
        alert("Salvo com sucesso na nuvem!");
    }

    useEffect(()=>{
        downloadFromServer();
    }, [courseId, order, navigate]);

    const addQuestion = async()=>{ // Cria uma questão vazia
        const newQuestion: Question = {
            enunciation: "",
            answer: 0,
            penalization: 0,
            alternatives: []
        }
        setQuestions(prev =>prev ? [...prev, newQuestion] : [newQuestion]); // Equivalente ao array.psuh
    }
    const addAlternative = (question: number) => { // Cria uma alternativa
        setQuestions(prev =>
            prev?.map((q, idx) =>
                idx === question
                    ? { ...q, alternatives: [...q.alternatives, ""] }
                    : q
            )
        );
    };
    const removeAlternative = (qIdx: number, aIdx: number) => {
        setQuestions(prev =>prev?.map((q, idx) =>
            idx === qIdx ? {
                    ...q,
                    alternatives: q.alternatives.filter((_, i) => i !== aIdx)
                }
            : q
        ))}
    const removeQuestion = (qIdx: number) => {
        setQuestions(prev =>
            prev?.filter((_, idx) => idx !== qIdx)
        );
    };
    // Permite a alteração dos inputs e garante o controle pelo React - INÍCIO
    const handleEnunciationChange = (qIdx: number, value: string) => {
        setQuestions(prev =>
            prev?.map((q, idx) =>
                idx === qIdx ? { ...q, enunciation: value } : q
            )
        );
    };
    const handlePenalizationChange = (qIdx: number, value: number) => {
        setQuestions(prev =>
            prev?.map((q, idx) =>
                idx === qIdx ? { ...q, penalization: value } : q
            )
        );
    };
    const handleAlternativeChange = (qIdx: number, aIdx: number, value: string) => {
        setQuestions(prev =>
            prev?.map((q, idx) =>
                idx === qIdx
                    ? {
                        ...q,
                        alternatives: q.alternatives.map((alt, i) =>
                            i === aIdx ? value : alt
                        ),
                    }
                    : q
            )
        );
    };
    const handleAnswerChange = (qIdx: number, aIdx: number) => {
        setQuestions(prev =>
            prev?.map((q, idx) =>
                idx === qIdx ? { ...q, answer: q.answer === aIdx ? -1 : aIdx } : q
            )
        );
    };
    // Frescura do React - FIM
    
    return (
        <>
            <Nav />
            <div id="quiz-editor">
                <header>
                    <SideLevels courseId={courseId} order={order} type="Nível quiz" />
                </header>
                <main>
                    <div className="questions">
                    {questions?.map((question, qIdx)=>(
                        <section key={qIdx} className="question" id="1">
                            <div className="enunciation">
                                <p>Pergunta:</p>
                                <input value={question.enunciation} onChange={e=>handleEnunciationChange(qIdx, e.target.value)} />
                            </div>
                            <p>Alternativas: </p>
                            {question.alternatives?.map((alternative, aIdx)=>(
                                <div className="respose" key={`${qIdx}-${aIdx}`}>
                                    <p>{aIdx}</p>
                                    <input id={`${qIdx}-${aIdx}`} onChange={e=>handleAlternativeChange(qIdx, aIdx, e.target.value)} />
                                    <input type="checkbox" checked={question.answer===aIdx} onChange={()=>handleAnswerChange(qIdx, aIdx)} />
                                    <button className="delete" onClick={()=>removeAlternative(qIdx, aIdx)}><img src={closeIcon} /></button>
                                </div>
                            ))}
                            <button className="add-response" onClick={()=>addAlternative(qIdx)}>+</button>
                            <div className="penalization">
                                <p>Erro tira quantas vidas?</p>
                                <input type="number" value={question.penalization} onChange={e=>handlePenalizationChange(qIdx, Number(e.target.value))}></input>
                            </div>
                            <button onClick={()=>removeQuestion(qIdx)} className="delete"><img src={closeIcon} /></button>
                        </section>
                        ))}
                        <button onClick={()=>addQuestion()}>+</button>
                    </div>
                    <button onClick={()=>saveToServer()}>Salvar na nuvem</button>
                    <button onClick={()=>downloadFromServer()}>Carregar da nuvem</button>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default QuizEditor;