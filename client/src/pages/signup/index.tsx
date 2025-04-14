import "./style.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import api from "../../api";

function SignUp(){
    const sendSignUp = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try{
            const formData = new FormData(ev.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            const status = await api.post("/signup", data);
            console.log(status)
        }
        catch{
            
        }
    }
    return (
        <>
            <Nav />
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
                </form>
            </main>
            <Footer />
        </>
    )
}

export default SignUp;