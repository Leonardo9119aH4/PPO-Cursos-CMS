import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import './courseEditor.scss';
import { useState, useRef, useEffect } from 'react';
import api from '../../api';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';

function CourseEditor() {
    const navigate = useNavigate();
    const {courseId} = useParams<{courseId: string}>();
    useEffect(()=>{
        (async()=>{
            try{
                const info = await api.get(`/getCourseToEdit/${courseId}`);
                if(info.status == 204){
                    navigate("/");
                    return;
                }
                
            }
            catch(er: any){
                if(er.response.status == 404){
                    if(er.response.data[1] == 0){
                        navigate("/");
                    }
                    else if(er.response.data[1] == 1){

                    }
                    else{

                    }
                }
            }
            
        })();
    })
    return (
        <>
            <Nav />
            <div id="course-editor">
                <main>
                    <ul>

                    </ul>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default CourseEditor;