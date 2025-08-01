import './courses.scss';
import { useRef, useState } from 'react';
import api from '../../api';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';

function Courses(){
    
    return (
        <>
            <Nav />
            <div id="courses">
                <main>
                    <section id="playing">

                    </section>
                    <section id="finished">

                    </section>
                    <section id="mycourses">

                    </section>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default Courses;