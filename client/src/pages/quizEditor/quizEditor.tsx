import "./quizEditor.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import SideLevels from "../../components/sideLevels/sideLevels";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../../api";
import { Level, Question } from "../../types";

function QuizEditor(){
    const {courseId, order} = useParams<{courseId: string; order: string}>();
    const [quizContent, setQuizContent] = useState(false);
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>();
    useEffect(()=>{
        (async()=>{
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
        })();
    }, [courseId, order, navigate]);
    return (
        <>
            <Nav />
            <div id="quiz-editor">
                <header>
                    <SideLevels courseId={courseId} order={order} type="Nível quiz" />
                </header>
                <main>
                    {questions?.map((question, qIdx)=>(
                        <section className="question" id="1">
                            <div className="enunciation">
                                <input></input>
                                <input type="checkbox"></input>
                            </div>
                            <input className="response" id="1-1"></input>
                            <button className="add-response"></button>
                            <div className="penalization">
                                <p>Erro tira quantas vidsas?</p>
                                <input type="number"></input>
                            </div>
                            <button className="delete"></button>
                        </section>
                        ))}
                </main>
            </div>
            <Footer />
        </>
    )
}

export default QuizEditor;