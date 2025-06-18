import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import './courseEditor.scss';
import { useState, useRef } from 'react';

function CourseEditor() {
    
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