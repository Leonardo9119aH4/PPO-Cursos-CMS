import "./theoryEditor.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import { useEffect } from "react";
import api from "../../api";
import { useNavigate, useParams } from "react-router-dom";

function TheoryEditor() {
    const {courseId, order} = useParams<{courseId: string; order: string}>();
    const navigate = useNavigate();
    useEffect(()=>{
        (async()=>{
            try{
                const level = await api.get(`/getleveltoedit/${courseId}/${order}`);
                console.log(level.data)
            }
            catch(er: any){
                if(er.response.status == 401){
                    navigate("/signin");
                }
            }
        })();
    });
    return (
        <>
            <Nav />
            <div id="theory-editor">
                <main>
                    <div></div>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default TheoryEditor;