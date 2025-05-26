import './newCourse.scss';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';

function NewCourse(){
    const sendNewCourse = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try{
            const formData = new FormData(ev.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
        }
        catch(er){

        }
    }
    return (
        <>
            <Nav />
            <div id="newcourse">
                <form>
                    <label>
                        <p>Título:</p>
                        <input type="text" name="title" required />
                    </label>
                    <label>
                        <p>Descrição:</p>
                        <input type="text" name="description" required />
                    </label>
                    <label>
                        <p>Imagem:</p>
                        <input type="image" name="thubnail" required />
                    </label>
                    <label>
                        <p>Máximo de vidas:</p>
                        <input type="number" name="maxLifes" required />
                    </label>
                    <label>
                        <p>Prática recupera quantas vidas?</p>
                        <input type="number" name="practiceRecoveryLife" required />
                    </label>
                    <label>
                        <p>Tempo para recuperar 1 vida:</p>
                        <input type="time" name="timeRecoveryLife" required />
                    </label>
                    <button type="submit">CADASTRAR</button>
                </form>
            </div>
            <Footer />
        </>
    )
}

export default NewCourse;