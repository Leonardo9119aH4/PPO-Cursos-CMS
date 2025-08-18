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
import SideLevels from "../../components/sideLevels/sideLevels";

function TheoryEditor() {
    const {courseId, order} = useParams<{courseId: string; order: string}>();
    const [textContent, setTextContent] = useState<any>();
    const navigate = useNavigate();
    const saveTheoryRemote = () => {
        try{
            api.post(`/saveLevel/${courseId}/${order}`, textContent);
        }
        catch(er){

        }
    }
    const getTheoryRemote = async () => {
        try{
            const level = await api.get<Level>(`/getleveltoedit/${courseId}/${order}`);
            localStorage.setItem(`theoryEditorContent-${courseId}-${order}`, JSON.stringify(level.data.content));
            setTextContent(level.data.content);

        }
        catch(er){

        }
    }

    useEffect(()=>{
        (async()=>{
            try{
                const level = await api.get<Level>(`/getleveltoedit/${courseId}/${order}`);
                if(level.data == null || level.data == undefined){
                    navigate(`/courseEditor/${courseId}`);
                }
                if(Number(level.data.type) == 1){ //VS Code burro
                    navigate(`/quizEditor/${courseId}/${order}`);
                }
                const saved = localStorage.getItem(`theoryEditorContent-${courseId}-${order}`);
                if(saved){
                    setTextContent(JSON.parse(saved));
                }
                else{
                    localStorage.setItem(`theoryEditorContent-${courseId}-${order}`, JSON.stringify(level.data.content));
                    setTextContent(level.data.content);
                }
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
    useEffect(() => { // Detecta as alterações feitas pelo usuário e a salva no localstorage
        if(textContent && courseId && order) {
            localStorage.setItem(`theoryEditorContent-${courseId}-${order}`, JSON.stringify(textContent));
        }
    }, [textContent, courseId, order]);

    return (
        <>
            <Nav />
            <div id="theory-editor">
                <header>
                    <SideLevels courseId={courseId} order={order} type="Nível teórico" />
                </header>
                <main>
                    <RichTextEditor value={textContent} onChange={setTextContent} />
                    <button onClick={()=>getTheoryRemote()}>Carregar da nuvem</button>
                    <button onClick={()=>saveTheoryRemote()}>Salvar na nuvem</button>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default TheoryEditor;