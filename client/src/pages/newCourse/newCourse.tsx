import './newCourse.scss';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import api from '../../api';

function NewCourse(){
    const sendNewCourse = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try{
            const formData = new FormData(ev.target as HTMLFormElement);
            const courseResponse = await api.post("/newcourse", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Title": formData.get("title") as string //gambiarra pra acessar o título no backend antes do multer
                }
            });
            console.log(courseResponse);
        }
        catch(er: any){
            console.log(er.response.data);
        }
    }
    return (
        <>
            <Nav />
            <div id="newcourse">
                <main>
                    <form onSubmit={sendNewCourse}>
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
                            <input type="file" name="thumbnail" accept='image/*' required />
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
                </main>
            </div>
            <Footer />
        </>
    )
}

export default NewCourse;