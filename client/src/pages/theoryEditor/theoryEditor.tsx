import "./theoryEditor.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import { useEffect } from "react";
import api from "../../api";

function TheoryEditor() {
    useEffect(()=>{
        (async()=>{
            try{
                const level = await api.get("/getleveltoedit/2");
                console.log(level)
            }
            catch(er){
                console.log(er)
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