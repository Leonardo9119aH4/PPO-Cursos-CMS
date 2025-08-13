import "./theoryEditor.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Level } from "../../types";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import RichTextEditor from "../../components/rtEditor/RichTextEditor";

function TheoryEditor() {
    const {courseId, order} = useParams<{courseId: string; order: string}>();
    const [textContent, setTextContent] = useState<any>(()=>{
        const saved = localStorage.getItem(`theoryEditorContent-${courseId}-${order}`);
        return saved ? JSON.parse(saved) : null;
    });
    const navigate = useNavigate();
    const richTextExport = () => {
        console.log(textContent);
    }

    useEffect(()=>{
        (async()=>{
            try{
                const level = await api.get<Level>(`/getleveltoedit/${courseId}/${order}`);
                console.log(level.data)
               if(level.data == null || level.data == undefined){
                    navigate(`/courseEditor/${courseId}`);
               }
                if(Number(level.data.type) == 1){ //VS Code burro
                    navigate(`/quizEditor/${courseId}/${order}`);
                }
                console.log(level.data)
            }
            catch(er: any){
                if(er.response.status == 401){
                    navigate("/signin");
                }
                if(er.response.status == 404){
                    navigate("/myCourses")
                }
            }
        })();
    }, [courseId, order, navigate]);
    useEffect(() => {
        if (courseId && order) {
            const saved = localStorage.getItem(`theoryEditorContent-${courseId}-${order}`);
            if (saved) setTextContent(JSON.parse(saved));
        }
    }, [courseId, order]);
    useEffect(() => {
        if (textContent && courseId && order) {
            localStorage.setItem(`theoryEditorContent-${courseId}-${order}`, JSON.stringify(textContent));
        }
    }, [textContent, courseId, order]);

    return (
        <>
            <Nav />
            <div id="theory-editor">
                <header>
                    <div id="sideLevels"><Link to={`/theoryEditor/${courseId}/${Number(order) - 1}`}>←</Link>Nível {order}<Link to={`/theoryEditor/${courseId}/${Number(order) + 1}`}>→</Link></div> 
                    <p>Nível teórico</p> {/* Melhorar (prequiça é osso) */}
                </header>
                <main>
                    <RichTextEditor value={textContent} onChange={setTextContent} />
                    <button onClick={()=>richTextExport()}>Salvar</button>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default TheoryEditor;