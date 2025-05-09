import Footer from '../../components/footer/footer';
import Nav from '../../components/nav/nav';
import './profile.scss';
import logo from '../../assets/react.svg'
import { useEffect } from 'react';
import api from '../../api';

function Profile(){
    useEffect(()=>{
        const updateProfile = async () => {
            const account = await api.get("/getinfo");
            console.log(account)
        }
        updateProfile();
    })
    return (
        <>
            <Nav />
            <menu>

            </menu>
            <main>
                <section id="welcome">
                    <img src={logo} />
                    <h1 id="username">Bem vind{} {}!</h1>
                </section>
                <section id="accountInfo">
                    <span id="username">Nome de usuário: {} <button></button></span>
                    <span id="realnamename">{}</span>
                    <span id="email">Email: {} <button></button></span>
                    <span id="phone">{}</span>
                </section>
                <section id="security">

                </section>

            </main>
            <Footer />
        </>
    );
}

export default Profile;