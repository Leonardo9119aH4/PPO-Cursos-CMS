import './nav.scss';
import logo from '../../assets/react.svg'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';

function Nav(){
    const [isHideNav, setIsHideNav] = useState(false);
    const toggleNav = () => {
        setIsHideNav(!isHideNav);
        const navHeight = isHideNav ? '12.5vh' : '0';
        document.documentElement.style.setProperty('--navHeight', navHeight);
    }
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(()=>{
        const updateNav = async ()=>{
            try{
                const accountInfo = await api.get("/getinfo");
                console.log(accountInfo.status)
                if(accountInfo.status == 200){
                    setIsLoggedIn(true);
                }
                else{
                    setIsLoggedIn(false);
                }
            }
            catch(er: any){
                setIsLoggedIn(false);
            }  
        }
        updateNav();
    })

    return (
        <>
        <nav className={isHideNav ? 'hidden' : ''}>
            <img src={logo} alt="Logo" />
            <div id="navLinks">
            {isLoggedIn ? (
                <>
                    <Link className="navLink" to="/profile">Perfil</Link>
                    <Link className="navLink" to="/courses">Cursos</Link>
                </>
                ) : (
                <>
                    <Link className="navLink" to='/signin'>Entrar</Link>
                    <Link className="navLink" to='/signup'>Cadastrar</Link>
                </>
                )}
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