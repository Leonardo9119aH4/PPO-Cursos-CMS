import "./newLevel.scss";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import api from "../../api";

function NewLevel(){
    const sendNewLevel = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try{
            const formData = new FormData(ev.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            const accountResponse = await api.post("/signin", data);
        }
        catch(er){

        }
    }
    return (
        <>
            <Nav />
            <div id="new-level">
                <main>
                    <form onSubmit={sendNewLevel}>
                        <label>
                            <p>Título: </p>
                            <input type="text" name="title" required />
                        </label>
                        <label>
                            <p>Tipo: </p>
                            <select name="type" required>
                                <option value="">Selecione o tipo</option>
                                <option value="theory">Teórico</option>
                                <option value="quiz">Quiz</option>
                            </select>
                        </label>
                        <label>
                            <p>Vidas recuperadas ao passar de nível: </p>
                            <input type="number" name="recoveryLifes" required />
                        </label>
                    </form>
                </main>
            </div>
            <Footer />
        </>
    )
}

export default NewLevel;