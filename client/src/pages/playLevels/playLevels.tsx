import { useNavigate, useParams } from "react-router";
import Footer from "../../components/footer/footer";
import Nav from "../../components/nav/nav";
import "./playLevels.scss";
import { useEffect, useState } from "react";
import { Course, Level, Studying } from "../../types";
import api from "../../api";
import { Link } from "react-router-dom";
import Modal from "../../components/modal/modal";
import levelImg from "../../assets/level.png";

function PlayLevels(){
    const {courseId} = useParams<{courseId: string}>();
    const [playLevels, setPlayLevels] = useState<Level[]>();
    const [lifes, setLifes] = useState<number>(0);
    const [topUsers, setTopUsers] = useState<Array<{userId:number, username?:string|null, realname?:string|null, xp:number}>>([]);
    const [userXp, setUserXp] = useState<number | null>(null);
    const navigate = useNavigate();
    const [showNoLifeModal, setShowNoLifeModal] = useState<boolean>(false);
    useEffect(()=>{
        (async()=>{
            try{
                const course = await api.get<Course>(`/getCourse/${courseId}`);
                setPlayLevels(course.data.levels);
                const studying = await api.get<Studying>(`/getStudying/${courseId}`);
                setLifes(studying.data.lifes);
                // fetch ranking and user's xp
                try{
                    const rankResp = await api.get(`/rankUsers/${courseId}`);
                    setTopUsers(rankResp.data || []);
                }
                catch(_){
                    setTopUsers([]);
                }
                try{
                    const xpResp = await api.get(`/userxp/${courseId}`);
                    setUserXp(xpResp.data?.xp ?? null);
                }
                catch(_){
                    setUserXp(null);
                }
            }
            catch(er: any){
                if(er.response.status == 404 || er.response.status == 403){
                    navigate("/courses");
                }
                if(er.response.status == 401){
                    navigate("/signin");
                }
            }
        })();
    }, [courseId]);
    
    return (
        <>
            <Nav />
            <div id="play-levels">
                <main>
                    <div id="levels">
                    <ul>
                    {playLevels?.map((level, i)=>(
                        <li key={i}>
                            <button className="level-link" onClick={()=>{
                                // Se usuário sem vidas, mostra modal e impede iniciar nível
                                if(lifes <= 0){
                                    setShowNoLifeModal(true);
                                    return;
                                }
                                navigate(`${Number(level.type) === 1 ? "/playQuiz" : "/viewTheory"}/${level.id}`);
                            }}>{i}</button>
                        </li>
                    ))}
                    </ul>
                    </div>
                    <div id="game">
                        <div id="lifes">
                            <h1>{lifes}</h1>
                            <Link to={`/practice/${courseId}`}>PRATICAR</Link>
                        </div>
                        <div id="rank">
                            <h2>Ranking</h2>
                            <ul className="rank-list">
                                {topUsers.map((u, idx)=>(
                                    <li key={u.userId} className="rank-item">
                                        <span className="pos">{idx+1}.</span>
                                        <span className="name">{u.username ?? u.realname ?? 'Usuário'}</span>
                                        <span className="xp">{u.xp} XP</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="user-xp">Seu XP: {userXp ?? '-'}</div>
                            </div>
                    </div>
                </main>
                <Modal isOpen={showNoLifeModal} onClose={()=>setShowNoLifeModal(false)} title="Sem vidas">
                    <p>Você não pode começar um novo nível sem vidas. Pratique para recuperar vidas antes de tentar novamente.</p>
                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <button onClick={()=>{
                            setShowNoLifeModal(false);
                            if(courseId) navigate(`/practice/${courseId}`);
                        }}>Ir para prática</button>
                        <button onClick={()=>setShowNoLifeModal(false)}>Fechar</button>
                    </div>
                </Modal>
            </div>
            <Footer />
        </>
    )
}

export default PlayLevels;