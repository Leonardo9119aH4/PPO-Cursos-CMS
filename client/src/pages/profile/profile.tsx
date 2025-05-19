import Footer from '../../components/footer/footer';
import Nav from '../../components/nav/nav';
import './profile.scss';
import logo from '../../assets/react.svg'
import { useEffect, useState, useRef} from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import editIcon from '../../assets/edit_icon.svg';
import checkIcon from '../../assets/check_icon.svg';
import closeIcon from '../../assets/close_icon.svg';

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
    const inputUsernameRef = useRef<HTMLInputElement>(null);
    const inputRealnameRef = useRef<HTMLInputElement>(null);
    const inputEmailRef = useRef<HTMLInputElement>(null);
    const inputPhoneRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        const updateProfile = async () => {
            try{
                const account = await api.get("/getinfo");
                if(account.status == 204){
                    navigate("/");
                    return;
                }
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
    });

    const logOut = async () => {
        api.delete("/logout");
        navigate("/");
    }
    const updateAccount = async (account: any) => {
        setUsernameHook(account.data.username);
        setRealnameHook(account.data.realname);
        setEmailHook(account.data.email);
        setPhoneHook(account.data.phone);
    }

    const editUsername = async () => {
        setIsEditingUsername(true);
    }
    const saveUsername = async () => {
        const data = {
            username: inputUsernameRef.current?.value,
            realname: null,
            email: null,
            phone: null
        }
        try{
            const account = await api.put("/update", data);
            updateAccount(account);
            setIsEditingUsername(false);
        }
        catch(er: any){
            if(er.response.status == 404){
                navigate("/");
                return;
            }
            if(er.response.status == 409){
                inputUsernameRef.current?.setCustomValidity(er.response.data);
                inputUsernameRef.current?.reportValidity(); 
                return;
            }
        }
    }
    const cancelUsername = async () => {
        setIsEditingUsername(false);
    }
    const editRealname = async () => {
        setIsEditingRealname(true);
    }
    const saveRealname = async () => {
        const data = {
            username: null,
            realname: inputRealnameRef.current?.value,
            email: null,
            phone: null
        }
        try{
            const account = await api.put("/update", data);
            updateAccount(account);
            setIsEditingRealname(false);
        }
        catch(er: any){
            if(er.response.status == 404){
                navigate("/");
                return;
            }
        }
    }
    const cancelRealname = async () => {
        setIsEditingUsername(false);
    }
    const editEmail = async () => {
        setIsEditingEmail(true);
    }
    const saveEmail = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = inputEmailRef.current?.value;
        if (email != null && !emailRegex.test(email)) {
            inputEmailRef.current?.setCustomValidity("Digite um e-mail válido!");
            inputEmailRef.current?.reportValidity();
            return;
        }
        const data = {
            username: null,
            realname: null,
            email: inputEmailRef.current?.value,
            phone: null
        }
        try{
            const account = await api.put("/update", data);
            updateAccount(account);
            setIsEditingEmail(false);
        }
        catch(er: any){
            if(er.response.status == 404){
                navigate("/");
                return;
            }
            if(er.response.status == 409){
                inputUsernameRef.current?.setCustomValidity(er.response.data);
                inputUsernameRef.current?.reportValidity(); 
                return;
            }
        }
    }
    const cancelEmail = async () => {
        setIsEditingEmail(false);
    }
    const editPhone = async () => {
        setIsEditingPhone(true);
    }
    const savePhone = async () => {
        const data = {
            username: null,
            realname: null,
            email: null,
            phone: inputPhoneRef.current?.value,
        }
        try{
            const account = await api.put("/update", data);
            updateAccount(account);
            setIsEditingPhone(false);
        }
        catch(er: any){
            if(er.response.status == 404){
                navigate("/");
                return;
            }
        }
    }
    const cancelPhone = async () => {
        setIsEditingPhone(false);
    }

    return (
        <>
            <Nav />
            <div id="profile">
                <menu>
                    <a href="#welcome">Bem-vindo</a>
                    <a href="#accountInfo">Editar perfil</a>
                    <a href="#security">Segurança</a>
                    <button className="logoutButton" onClick={logOut}>Sair</button>
                </menu>
                <main>
                    <section id="welcome">
                        <img id="userphoto" src={logo} />
                        <h1 id="username">Bem-vindo(a) {usernameHook}!</h1>
                    </section>
                    <section id="accountInfo">
                        <h1>Informações de conta:</h1>
                        {isEditingUsername ? (
                            <span id="username">
                                Nome de usuário: <input ref={inputUsernameRef} />
                                <button onClick={saveUsername}><img src={checkIcon} /></button>
                                <button onClick={cancelUsername}><img src={closeIcon} /></button>
                            </span>
                        ) : (
                            <span id="username">Nome de usuário: {usernameHook}<button onClick={editUsername}><img src={editIcon} /></button></span>
                        )}
                        {isEditingRealname ? (
                            <span id="realname">
                                Nome de usuário: <input ref={inputRealnameRef} />
                                <button onClick={saveRealname}><img src={checkIcon} /></button>
                                <button onClick={cancelRealname}><img src={closeIcon} /></button>
                            </span>
                        ) : (
                            <span id="realname">Nome real: {realnameHook} <button onClick={editRealname}><img src={editIcon} /></button></span>
                        )}
                        {isEditingEmail ? (
                            <span id="email">
                                Nome de usuário: <input type="email" ref={inputEmailRef} />
                                <button onClick={saveEmail}><img src={checkIcon} /></button>
                                <button onClick={cancelEmail}><img src={closeIcon} /></button>
                            </span>
                        ) : (
                            <span id="email">Email: {emailHook} <button onClick={editEmail}><img src={editIcon} /></button></span>
                        )}
                        {isEditingPhone ? (
                            <span id="phone">
                                Telefone: <input ref={inputPhoneRef} />
                                <button onClick={savePhone}><img src={checkIcon} /></button>
                                <button onClick={cancelPhone}><img src={closeIcon} /></button>
                            </span>
                        ) : (
                            <span id="phone">Telefone: {phoneHook} <button onClick={editPhone}><img src={editIcon} /></button></span>
                        )}
                    </section>
                    <section id="security">
                        <h1>Segurança:</h1>
                        <span id="password">Senha: ********** <button><img src={editIcon} /></button></span>
                        <button className="logoutButton" onClick={logOut}>Sair</button>
                    </section>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default Profile;
