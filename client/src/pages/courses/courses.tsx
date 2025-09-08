import './courses.scss';
import { useEffect, useRef, useState } from 'react';
import api from '../../api';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import CoursesCarousel from '../../components/CoursesCarousel/CoursesCarousel';
import { Link, useNavigate } from 'react-router-dom';
import { Course, User } from '../../types';
import Modal from '../../components/modal/modal';

function Courses(){
    const [doingCourses, setDoingCourses] = useState<any[]>([]);
    const [topCourses, setTopCourses] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [courseAuthor, setCourseAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        (async()=>{
            try{
                const playingCourses = await api.get<Course[]>("/getcourses/1");
                setDoingCourses(playingCourses.data);
                const notPlayingCourses = await api.get<Course[]>("/getcourses/2");
                setTopCourses(notPlayingCourses.data);
            }
            catch(er: any){
                if(er.response.status == 401){ // Caso o usuário não esteja logado
                    try{
                        const courses = await api.get<Course[]>("/getcourses");
                        setTopCourses(courses.data);
                    }
                    catch(er){
                        console.error(er);
                    }
                }
                else{
                    console.error(er);
                }
            }
        })();
    }, []);

    const openModal = (course: Course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
        setCourseAuthor(null);
    };
    const startNewCourse = async()=>{
        try{
            const response = await api.post(`/startCourse/${selectedCourse?.id}`);
            navigate(`/playLevels/${selectedCourse?.id}`);
        }
        catch(er){
            console.error("Erro ao criar o studying no banco de dados: ", er);
        }
    }

    useEffect(()=>{
        (async()=>{
            if (isModalOpen && selectedCourse) {
                setLoading(true);
                try {
                    const response = await api.get(`/getUserPublicInfo/${selectedCourse.userId}`);
                    setCourseAuthor(response.data);
                }
                catch (error) {
                    console.error('Erro ao buscar o autor do curso:', error);
                    setCourseAuthor(null);
                }
                finally {
                    setLoading(false);
                }
            }
        })();
    },[isModalOpen, selectedCourse]);

    return (
        <>
            <Nav />
            <div id="courses">
                <main>
                    {
                        doingCourses.length > 0 && (
                            <CoursesCarousel title="Em andamento" courses={doingCourses} renderActions={course=>(
                                <Link className='courseEditor' to={`/playLevels/${course.id}`}>Jogar</Link>
                            )}/>
                        )
                    }
                    <CoursesCarousel title="Em destaque" courses={topCourses} renderActions={course=>(
                        <button onClick={()=>openModal(course)}>Ver curso</button>
                    )}/>
                </main>
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Curso">
                    {loading ? (
                        <p>Carregando...</p>
                    ) : (
                        <>
                            <p>{selectedCourse?.description}</p>
                            <p>Máximo de vidas: {selectedCourse?.maxLifes}</p>
                            <p>Vidas recuperadas pela prática: {selectedCourse?.practiceRecoveryLife}</p>
                            <p>{selectedCourse?.levels?.length} níveis.</p>
                            <p>{"Criador por: "+courseAuthor?.username || "Erro ao buscar o autor do curso"}</p>
                            {doingCourses.length>0 ? (
                                <button onClick={startNewCourse}>Começar curso</button>
                            ) : (
                                <Link to="/signup">Começar curso</Link>
                            )}
                            <button onClick={closeModal}>Fechar</button>
                        </>
                    )}
                </Modal>
            </div>
            <Footer />
        </>
    );
}

export default Courses;