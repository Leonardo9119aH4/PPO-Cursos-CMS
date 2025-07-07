import './myCourses.scss';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import api from '../../api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyCourses(){
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    useEffect(()=>{
        (async()=>{
            try{
                const coursesArray = await api.get("/accountCourses");
                if(coursesArray.status == 204){
                    navigate("/");
                }
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
                    <section id="public">
                        <h1>Públicos</h1>
                        <div className='courses'>
                            {courses.filter(c => c.state === 1).map(course => {
                                return ( <div key={course.id}>
                                    <h1>{course.title}</h1>
                                    <img src={`http://localhost:3000/getFile/${course.thubnail}`} alt={course.title} />
                                    <p>{course.description}</p>
                                </div> )
                            })}
                        </div>
                    </section>
                    <section id="private">
                        <h1>Privados</h1>
                        <div className='courses'>
                            {courses.filter(c => c.state === 2).map(course => {
                                return ( <div key={course.id}>
                                    <h1>{course.title}</h1>
                                    <img src={`http://localhost:3000/getFile/${course.thubnail}`} alt={course.title} />
                                    <p>{course.description}</p>
                                </div> )
                            })}
                        </div>
                    </section>
                    <section id="incomplete">
                        <h1>Incompletos</h1>
                        <div className='courses'>
                            {courses.filter(c => c.state === 0).map(course => {
                                return ( <div key={course.id}>
                                    <h1>{course.title}</h1>
                                    <img src={`http://localhost:3000/getFile/${course.thubnail}`} alt={course.title} />
                                    <p>{course.description}</p>
                                </div> )
                            })}
                        </div>
                    </section>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default MyCourses;