import './footer.scss';
import {Link} from 'react-router-dom';

function Footer(){
    return (
        <footer>
            <section id="contact">
                <h1>Contato</h1>
                <a>Email: suporte@email.com</a>
                <a>Falar com suporte</a>
                <a>Enviar feedback</a>
            </section>
            <section id="info">
                <h1>Informações</h1>
                <a>FAQ</a>
                <a>Política de privacidade</a>
                <a>Termos de uso</a>
            </section>
            <section id="more">
                <h1>Mais sites</h1>
                <a href="https://leonardo9119ah4.github.io/Supimpa-IA23-leo/">Quiz e wiki de Minecraft</a>
                <a>Tycon de garrafa</a>
                <a href="https://ifc.edu.br/">IFC Reitoria</a>
                <a href="https://www.camboriu.ifc.edu.br/">IFC Camboriú</a>
            </section>
        </footer>
    )
}
export default Footer;