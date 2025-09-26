import './home.scss';
import { useRef, useState } from 'react';
import api from '../../api';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';

function Home() {
    return (
        <>
            <Nav />
            <div id="home">
                <main>
                    <h1>Minicursos grátis!</h1>
                    <p>Crie seus próprios minicursos gamificados, crie uma conta e comece hoje mesmo a criar seus próprios minicursos!</p>
                    <p>Ou jogue os minicursos da comunidade, e tente ser o melhor jogador de todos!</p>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default Home;
