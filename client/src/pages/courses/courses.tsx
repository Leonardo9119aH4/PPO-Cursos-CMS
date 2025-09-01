import './courses.scss';
import { useEffect, useRef, useState } from 'react';
import api from '../../api';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import CoursesCarousel from '../../components/CoursesCarousel/CoursesCarousel';
import { Link } from 'react-router-dom';
import { Course } from '../../types';
import Modal from '../../components/modal/Modal';

function Courses(){
    const [courses, setCourses] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(()=>{
        (async()=>{
            const courses = await api.get<Course[]>("/getcourses");
            setCourses(courses.data);
        })();
    }, []);
    return (
        <>
            <Nav />
            <div id="courses">
                <main>
                    <CoursesCarousel title="Em andamento" courses={courses} renderActions={course=>(
                        <Link className='courseEditor' to={`/playLevels/${course.id}`}>Jogar</Link>
                    )}/>
                    <CoursesCarousel title="Em destaque" courses={courses} renderActions={course=>(
                        <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Curso" >

                        </Modal>
                    )}/>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default Courses;