import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import './courseEditor.scss';
import { useState, useRef, useEffect } from 'react';
import api from '../../api';
import { useParams, Link } from 'react-router';
import { useNavigate } from 'react-router';
import { Course, Level } from '../../types';
import trash from "../../assets/trash.svg";
import edit from "../../assets/edit_icon.svg";
import check from "../../assets/check_icon.svg";

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
    const [forms, setForms] = useState<Course>();
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
                setForms(info.data);
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
        const value = Number(recoveryLifesInputRef.current?.value);
        if(value){
            api.post(`/updateLevel/${courseId}/${level}`, {recoveryLifes: value});
            setLevels(prev =>
                prev.map((l, i) =>
                    i === level
                        ? { ...l, recoveryLifes: value, editRecoveryLevel: false }
                        : l
                )
            )
        }
        else{
            setLevels(prev =>
                prev.map((l, i) =>
                    i === level ? { ...l, editRecoveryLevel: false } : l
                )
            );
        }
    }
    const updateCourse = (ev: React.FormEvent)=>{
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);
        api.post("/updatecourse", formData).catch(er=>{
            console.log(er.response.data);
        })
    }
    const publishCourse = ()=>{
        api.post(`/publishCourse/${courseId}`).catch(er=>{
            if(er.response.status == 400){
                alert("Você precisa ter 1 nível teórico e 1 nível quiz, com conteúdo");
            }
            console.log(er);
        })
    }
    return (
        <>
            <Nav />
            <div id="course-editor">
                <main>
                    <div className='levels-view'>
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
                                            <button onClick={()=>deleteLevel(idx)} id="delete"><img src={trash} /></button></>
                                        ) : (
                                            <><p>Nível quiz</p>
                                            <p>Recupera { level.editRecoveryLevel ? (
                                                <><input className="recovery-lifes-input" ref={recoveryLifesInputRef} /><button onClick={()=>recoveryLifesSave(idx)}><img src={check} /></button></>
                                            ) : (
                                                <>{level.recoveryLifes} <button onClick={()=>recoveryLifesSetEditMode(idx)}><img src={edit} /></button></>
                                            )} vidas</p>
                                            <Link to={`/quizEditor/${courseId}/${level.order}`}>Editar</Link>
                                            <button onClick={()=>deleteLevel(idx)} id="delete"><img src={trash} /></button></>
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
                    </div>
                    <div className='edit-course'>
                        <form onSubmit={updateCourse}>
                            <label>
                                <p>Título:</p>
                                <input type="text" name="title" defaultValue={forms?.title} required />
                            </label>
                            <label>
                                <p>Descrição:</p>
                                <input type="text" name="description" defaultValue={forms?.description} />
                            </label>
                            {/* <label>
                                <p>Imagem:</p>
                                <input type="file" name="thumbnail" accept='image/*' required />
                            </label> */}
                            <label>
                                <p>Máximo de vidas:</p>
                                <input type="number" name="maxLifes" defaultValue={forms?.description} required />
                            </label>
                            <label>
                                <p>Prática recupera quantas vidas?</p>
                                <input type="number" name="practiceRecoveryLife" defaultValue={forms?.practiceRecoveryLife} required />
                            </label>
                            <label>
                                <p>Tempo para recuperar 1 vida:</p>
                                <input type="number" name="timeRecoveryLife" defaultValue={forms?.secondsRecoveryLife} required />
                            </label>
                            <button type="submit">ATUALIZAR</button>
                        </form>
                    </div>
                    <button onClick={()=>publishCourse()}>PUBLICAR</button>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default CourseEditor;