import { useEffect } from "react";
import Footer from "../../components/footer/footer";
import Nav from "../../components/nav/nav";
import "./viewTheory.scss";
import api from "../../api";

function ViewTheory(){
    useEffect(()=>{
        (async()=>{
            const level = api.get(``);
        })();
    });
    return (
        <>
            <Nav />
            <div id="view-theory">

            </div>
            <Footer />
        </>
    );
}

export default ViewTheory;