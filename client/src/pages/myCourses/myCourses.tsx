import './myCourses.scss';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import api from '../../api';
import { useEffect, useState } from 'react';

function MyCourses(){
    const [courses, setCourses] = useState<any[]>([]);
    useEffect(()=>{
        (async()=>{
            try{
                const coursesArray = await api.get("/accountCourses");
                setCourses(coursesArray.data);
                console.log(coursesArray.data)
                api.get("/getCourseThubnail/1750103035498_Acer_Wallpaper_01_5000x2814.jpg");
            }
            catch(er){
                console.log(er)
            }
        })();
        
    }, []);
    return (
        <>
            <Nav />
            <div id="mycourses">
                <main>
                    <section id="public">
                        {courses.filter(c => c.state === 1).map(course => {
                            return ( <div key={course.id}>
                                <h2>{course.title}</h2>
                                <p>{course.description}</p>
                            </div> )
                        })}
                    </section>
                    <section id="private">
                        {courses.filter(c => c.state === 2).map(course => {
                            return ( <div key={course.id}>
                                <h2>{course.title}</h2>
                                <p>{course.description}</p>
                            </div> )
                        })}
                    </section>
                    <section id="incomplete">
                        {courses.filter(c => c.state === 0).map(course => {
                            return ( <div key={course.id}>
                                <h2>{course.title}</h2>
                                <p>{course.description}</p>
                            </div> )
                        })}
                    </section>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default MyCourses;