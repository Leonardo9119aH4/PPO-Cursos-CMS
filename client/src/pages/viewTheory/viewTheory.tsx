import { useEffect, useState } from "react";
import Footer from "../../components/footer/footer";
import Nav from "../../components/nav/nav";
import "./viewTheory.scss";
import api from "../../api";
import { useNavigate, useParams } from "react-router";
import { Level } from "../../types";
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import SideLevels from "../../components/sideLevels/sideLevels";

function ViewTheory(){
    const {levelId} = useParams<{levelId: string}>();
    const navigate = useNavigate();
    const [theoryContent, setTheoryContent] = useState<string>('');
    const [level, setLevel] = useState<Level>();
    useEffect(()=>{
        (async()=>{
            try{
                const level = await api.get<Level>(`/getLevel/${levelId}`);
                if(Number(level.data.type)==1){
                    navigate(`/playQuiz/${levelId}`);
                }
                setLevel(level.data);
                if(level.data.content) {
                    const html = generateHTML(level.data.content, [
                        StarterKit,
                        // Adicione outras extensões que você usa no theoryEditor
                    ]);
                    setTheoryContent(html);
                }
            }
            catch(er: any){
                if(er.response.status == 404 || er.response.status == 403){
                    navigate("/courses");
                }
                if(er.response.status == 401){
                    navigate("/signin");
                }
            }
        })();
    });
    const finish = ()=>{

    }
    return (
        <>
            <Nav />
            <div id="view-theory">
                <header>
                    <h1>Nível {level?.order}</h1>
                </header>
                <main>
                    <div className="theory-content" dangerouslySetInnerHTML={{ __html: theoryContent }} />
                    <button onClick={()=>finish()}>OK</button>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default ViewTheory;