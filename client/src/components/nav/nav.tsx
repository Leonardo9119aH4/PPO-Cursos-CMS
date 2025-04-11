import './nav.scss';
import logo from '../../assets/react.svg'
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Nav(){
    const [isHideNav, setIsHideNav] = useState(false);
    const toggleNav = () => {
        setIsHideNav(!isHideNav);
        const navHeight = isHideNav ? '12.5vh' : '0';
        document.documentElement.style.setProperty('--navHeight', navHeight);
    }
    return (
        <>
        <nav className={isHideNav ? 'hidden' : ''}>
            <img src={logo} alt="Logo" />
            <div id="navLinks">
                <Link id="navLogIn" to='/signin'>Entrar</Link>
                <Link id="navSignUp" to='/signup'>Cadastrar</Link>
            </div>
        </nav>
        <div id="navButton">
            {isHideNav ? (
                <button onClick={toggleNav}>↓</button>
            ):(
                <button onClick={toggleNav}>↑</button>
            )}
        </div>
        </>
    )
}
export default Nav;