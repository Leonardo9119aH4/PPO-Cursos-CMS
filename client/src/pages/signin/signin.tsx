import "./signin.scss";
import { useRef, useState } from 'react';
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import api from "../../api";
import { useNavigate } from "react-router";

function SignIn(){
    const [accountStatus, setAccountStatus] = useState<String>("");
    const navigate = useNavigate();
    const sendSignUp = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try{
            const formData = new FormData(ev.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            const accountResponse = await api.post("/signin", data);
            setAccountStatus(String(accountResponse.data));
            navigate("/");
            
        }
        catch(er: any){
            setAccountStatus(String(er.response.data));
        }
    }
    return (
        <>
            <Nav />
            <main>
                <form onSubmit={sendSignUp}>
                    <label>
                        <p>Nome de usuário ou email:</p>
                        <input type="text" name="login" required />
                    </label>
                    <label>
                        <p>Senha:</p>
                        <input type="password" name="password" required />
                    </label>
                    <button type="submit">ENTRAR</button>
                    <div id="status">
                        {accountStatus}
                    </div>
                </form>
            </main>
            <Footer />
        </>
    )
}

export default SignIn;