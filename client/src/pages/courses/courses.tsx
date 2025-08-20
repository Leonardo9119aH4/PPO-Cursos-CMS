import './courses.scss';
import { useEffect, useRef, useState } from 'react';
import api from '../../api';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import CoursesCarousel from '../../components/CoursesCarousel/CoursesCarousel';
import { Link } from 'react-router-dom';
import { Course } from '../../types';

function Courses(){
    const [courses, setCourses] = useState<any[]>([]);
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
                    <CoursesCarousel title="Em destaque" courses={courses} renderActions={course=>(
                        <Link className='courseEditor' to={`/playLevels/${course.id}`}>Jogar</Link>
                    )}/>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default Courses;