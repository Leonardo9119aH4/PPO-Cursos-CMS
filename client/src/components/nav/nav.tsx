import './nav.scss';
import logo from '../../assets/react.svg'
import { Link } from 'react-router-dom';

function Nav(){
    return (
        <nav>
            <img src={logo} alt="Logo" />
            <button>^</button>
            <div id="navLinks">
                <Link id="navLogIn" to='/signin'>Entrar</Link>
                <Link id="navSignUp" to='/signup'>Cadastrar</Link>
            </div>
        </nav>
    )
}
export default Nav;