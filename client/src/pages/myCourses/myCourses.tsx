import './myCourses.scss';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import api from '../../api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CoursesCarousel from '../../components/CoursesCarousel/CoursesCarousel';

function MyCourses(){
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    useEffect(()=>{
        (async()=>{
            try{
                const coursesArray = await api.get("/accountCourses");
                setCourses(coursesArray.data);
            }
            catch(er: any){
                if(er.response.status == 401){
                    navigate("/");
                }
                console.log(er);
            }
        })();
        
    }, []);
    return (
        <>
            <Nav />
            <div id="mycourses">
                <main>
                    <CoursesCarousel
                        title="Públicos"
                        courses={courses.filter(c => c.state === 1)}
                        renderActions={course => (
                            <Link className='courseEditor' to={`/courseEditor/${course.id}`}>Editar curso</Link>
                        )}
                    />
                    <CoursesCarousel
                        title="Privados"
                        courses={courses.filter(c => c.state === 2)}
                        renderActions={course => (
                            <Link className='courseEditor' to={`/courseEditor/${course.id}`}>Editar curso</Link>
                        )}
                    />
                    <CoursesCarousel
                        title="Incompletos"
                        courses={courses.filter(c => c.state === 0)}
                        renderActions={course => (
                            <Link className='courseEditor' to={`/courseEditor/${course.id}`}>Editar curso</Link>
                        )}
                    />
                    <Link id="newCourse" to="/newCourse">Criar curso</Link>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default MyCourses;