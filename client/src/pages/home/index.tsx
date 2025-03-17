import { useRef, useState } from 'react';
import api from '../../api';
import Nav from '../../components/nav';
import './style.scss';

function Home() {
    // Estado para armazenar o texto a ser exibido na div
    const [hookTeste, setHookTeste] = useState<string>("");

    // Função assíncrona corretamente dentro do componente
    const teste = async () => {
        const req = await api.post('/signup');
        setHookTeste(String(req.data));  // Atualiza o estado com "ow"
    };

    return (
        <>
            <Nav />
            <main>
                <h1>HOME</h1>
                <h2>TESTE</h2>
                {/* O conteúdo da div é agora controlado pelo estado hookTeste */}
                <div>{hookTeste}</div>  
                <button onClick={teste}>Executar Teste</button>
            </main>
        </>
    );
}

export default Home;
