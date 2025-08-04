import "./theoryEditor.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import { useEffect } from "react";
import api from "../../api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Level } from "../../types";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FontSize, TextStyle } from "@tiptap/extension-text-style";

function TheoryEditor() {
    const {courseId, order} = useParams<{courseId: string; order: string}>();
    const navigate = useNavigate();
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontSize
        ],
        content: "Insira o seu texto aqui..."
    })
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
    });
    const setFontSize = (size: string) => {
        editor?.chain().focus().setFontSize(size).run();
    };
    return (
        <>
            <Nav />
            <div id="theory-editor">
                <header>
                    <div id="sideLevels"><Link to={`/theoryEditor/${courseId}/${Number(order) - 1}`}>←</Link>Nível {order}<Link to={`/theoryEditor/${courseId}/${Number(order) + 1}`}>→</Link></div> 
                    <p>Nível teórico</p> {/* Melhorar (prequiça é osso) */}
                </header>
                <main>
                    <div className="toolbar">
                        <button
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            className={editor?.isActive('bold') ? 'is-active' : ''}
                            type="button"
                        >
                            <b>B</b>
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            className={editor?.isActive('italic') ? 'is-active' : ''}
                            type="button"
                        >
                            <i>I</i>
                        </button>
                        <select
                            onChange={e => setFontSize(e.target.value)}
                            value={editor?.getAttributes('textStyle').fontSize || '16px'}
                        >
                            <option value="12px">12</option>
                            <option value="16px">16</option>
                            <option value="20px">20</option>
                            <option value="24px">24</option>
                            <option value="32px">32</option>
                        </select>
                    </div>
                    <EditorContent editor={editor} />
                </main>
            </div>
            <Footer />
        </>
    );
}

export default TheoryEditor;