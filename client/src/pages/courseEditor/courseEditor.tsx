import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import './courseEditor.scss';
import { useState, useRef, useEffect } from 'react';
import api from '../../api';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import { Course, Level, CourseInfo } from '../../types';

function CourseEditor() {
    const navigate = useNavigate();
    const {courseId} = useParams<{courseId: string}>();
    const [levels, setLevels] = useState<Level[]>([]);
    const [newLevelWindow, setNewLevelWindow] = useState<boolean>();
    useEffect(()=>{
        (async()=>{
            try{
                const info = await api.get<Course>(`/getCourseToEdit/${courseId}`);
                console.log(info.data)
                setLevels(info.data.levels);
            }
            catch(er: any){
                if(er.response.status == 401){
                    navigate("/signin");
                }
            }
        })();
    }, [courseId, navigate])
    const newTheory = async () => {
        const level = await api.post(`/createLevel/q/${courseId}`);
        navigate(`/theoryEditor/${level.data.order}`);
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
                                    <h1>A</h1>
                                </li>
                            ))
                        )}
                    </ul>
                    {newLevelWindow ? (
                        <div id="newLevelWindow">
                            <p>Selecione o tipo:</p>
                            <button onClick={() => newTheory()}>Nível teórico</button>
                            <button onClick={() => navigate("/")}>Nível prático</button>
                            <button onClick={() => setNewLevelWindow(false)}>Cancelar</button>
                        </div>
                    ) : (
                        <button onClick={() => setNewLevelWindow(true)}>+</button>
                    )}
                </main>
            </div>
            <Footer />
        </>
    )
}

export default CourseEditor;