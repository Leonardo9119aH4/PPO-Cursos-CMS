import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import './courseEditor.scss';
import { useState, useRef, useEffect } from 'react';
import api from '../../api';
import { useParams, Link } from 'react-router';
import { useNavigate } from 'react-router';
import { Course, Level } from '../../types';

function CourseEditor() {
    interface LevelHook extends Level{
        editRecoveryLevel: boolean;
    }
    const navigate = useNavigate();
    const {courseId} = useParams<{courseId: string}>();
    const [levels, setLevels] = useState<LevelHook[]>([]);
    const [newLevelWindow, setNewLevelWindow] = useState<boolean>();
    const [newQuizWindow, setNewQuizWindow] = useState<boolean>();
    const [quizLifes, setQuizLifes] = useState<number>(1);
    const recoveryLifesInputRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        (async()=>{
            try{
                const info = await api.get<Course>(`/getCourseToEdit/${courseId}`);
                const levels: LevelHook[] = info.data.levels.map(level => ({
                    ...level,
                    editRecoveryLevel: false
                }));
                setLevels(levels);
            }
            catch(er: any){
                if(er.response.status == 401){
                    navigate("/signin");
                }
            }
        })();
    }, [courseId, navigate])
    const newTheory = async () => {
        const level = await api.post(`/createLevel/0/${courseId}/0`);
        navigate(`/theoryEditor/${courseId}/${level.data.order}`);
    }
    const newQuizPopup = () => {
        setNewQuizWindow(true);
    }
    const newQuiz = async (lifesRecovery: number) => {
        const level = await api.post(`/createLevel/1/${courseId}/${lifesRecovery}`);
        navigate(`/theoryEditor/${courseId}/${level.data.order}`);
    }
    const deleteLevel = (level: number)=>{
        api.delete(`/deleteLevel/${courseId}/${level}`).catch(er=>{
            console.log(er.response.data);
        });
        setLevels(prev => prev.filter((_, i) => i !== level));
    }
    const recoveryLifesSetEditMode = (level: number) => {
        setLevels(prev =>
            prev.map((l, i) =>
                i === level ? { ...l, editRecoveryLevel: true } : l
            )
        );
    };
    const recoveryLifesSave = (level: number)=>{

        setLevels(prev =>
            prev.map((l, i) =>
                i === level ? { ...l, editRecoveryLevel: false } : l
            )
        );
    }
    return (
        <>
            <Nav />
            <div id="course-editor">
                <main>
                    <h1>Níveis</h1>
                    <ul>
                        {levels.length === 0 ? (
                            <h1>Não há níveis criados.</h1>
                        ) : (
                            levels.map((level, idx) => (
                                <li key={idx}>
                                    <h1>{level.order}</h1>
                                    {Number(level.type) == 0 ? ( //o Number() é porque o VS Code é burro e não quero falso erro
                                        <><p>Nível teórico</p>
                                        <Link to={`/theoryEditor/${courseId}/${level.order}`}>Editar</Link>
                                        <button onClick={()=>deleteLevel(idx)} id="delete">D</button></>
                                    ) : (
                                        <><p>Nível quiz</p>
                                        <p>Recupera { level.editRecoveryLevel ? (
                                            <><input className="recovery-lifes-input" /><button onClick={()=>recoveryLifesSave(idx)}>C</button></>
                                        ) : (
                                            <>{level.recoveryLifes} <button onClick={()=>recoveryLifesSetEditMode(idx)}>E</button></>
                                        )} vidas</p>
                                        <Link to={`/quizEditor/${courseId}/${level.order}`}>Editar</Link>
                                        <button onClick={()=>deleteLevel(idx)} id="delete">D</button></>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                    {newLevelWindow ? (
                        <div id="newLevelWindow">
                            <p>Selecione o tipo:</p>
                            <button onClick={() => newTheory()}>Nível teórico</button>
                            <button onClick={() => setNewQuizWindow(true)}>Nível quiz</button>
                            <button onClick={() => setNewLevelWindow(false)}>Cancelar</button>
                        </div>
                    ) : (
                        <button onClick={() => setNewLevelWindow(true)}>+</button>
                    )}
                    {newQuizWindow && (
                        <>
                            <input 
                                type="number"
                                value={quizLifes}
                                onChange={e => setQuizLifes(Number(e.target.value))}
                            />
                            <p>Completar o nível recupera quantas vidas?</p>
                            <button onClick={() => newQuiz(quizLifes)}>Criar</button>
                        </>
                    )}
                </main>
            </div>
            <Footer />
        </>
    )
}

export default CourseEditor;