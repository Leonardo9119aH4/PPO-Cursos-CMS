import "./signup.scss";
import { useRef, useState } from 'react';
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import api from "../../api";

function SignUp(){
    const [accountStatus, setAccountStatus] = useState<String>("");
    const sendSignUp = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try{
            const formData = new FormData(ev.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            const accountResponse = await api.post("/signup", data);
            setAccountStatus(String(accountResponse.data));
            
        }
        catch(er: any){
            setAccountStatus(String(er.response.data));
        }
    }
    
    return (
        <>
            <Nav />
            <div id="signup">
                <main>
                    <form onSubmit={sendSignUp}>
                        <label>
                            <p>Nome de usuário:</p>
                            <input type="text" name="username" required />
                        </label>
                        <label>
                            <p>Email:</p>
                            <input type="email" name="email" required />
                        </label>
                        <label>
                            <p>Nome real:</p>
                            <input type="text" name="realname" />
                        </label>
                        <label>
                            <p>Telefone:</p>
                            <input type="tel" name="phone" />
                        </label>
                        <label>
                            <p>Senha:</p>
                            <input type="password" name="password" required />
                        </label>
                        <button type="submit">CADASTRAR</button>
                        <div id="status">
                            {accountStatus}
                        </div>
                    </form>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default SignUp;