import Footer from '../../components/footer/footer';
import Nav from '../../components/nav/nav';
import './profile.scss';
import logo from '../../assets/react.svg'
import { useEffect, useState} from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import editIcon from '../../assets/edit_icon.svg';

function Profile(){
    const navigate = useNavigate();
    const [usernameHook, setUsernameHook] = useState<string>("");
    const [realnameHook, setRealnameHook] = useState<string>("");
    const [emailHook, setEmailHook] = useState<string>("");
    const [phoneHook, setPhoneHook] = useState<string>("");
    const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
    const [isEditingRealname, setIsEditingRealname] = useState<boolean>(false);
    const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
    const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
    useEffect(()=>{
        const updateProfile = async () => {
            try{
                const account = await api.get("/getinfo");
                if(account.status == 204){
                    navigate("/");
                    return;
                }
                console.log(account.data) //debug
                setUsernameHook(account.data.username);
                setRealnameHook(account.data.realname);
                setEmailHook(account.data.email);
                setPhoneHook(account.data.phone);
            }
            catch(er: any){
                if(er.response.status == 404){
                    navigate("/");
                    return;
                }
            }


        }
        updateProfile();
    })
    return (
        <>
            <Nav />
            <div id="profile">
                <menu>
                    <a href="#welcome">Bem-vindo</a>
                    <a href="#accountInfo">Editar perfil</a>
                    <a href="#security">Segurança</a>
                </menu>
                <main>
                    <section id="welcome">
                        <img id="userphoto" src={logo} />
                        <h1 id="username">Bem-vindo(a) {usernameHook}!</h1>
                    </section>
                    <section id="accountInfo">
                        <h1>Informações de conta:</h1>
                        {isEditingUsername ? (

                        ) : (
                            <span id="username">Nome de usuário: {usernameHook} <button><img src={editIcon} /></button></span>
                        )}
                        <span id="realnamename">Nome real: {realnameHook} <button><img src={editIcon} /></button></span> 
                        <span id="email">Email: {emailHook} <button><img src={editIcon} /></button></span>
                        <span id="phone">Telefone: {phoneHook} <button><img src={editIcon} /></button></span>
                    </section>
                    <section id="security">
                        <h1>Segurança:</h1>
                        <span id="password">Senha: ********** <button><img src={editIcon} /></button></span>
                    </section>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default Profile;
