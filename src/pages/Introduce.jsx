import { useState, useEffect } from "react";
import { fetchExecutives } from '../api/introduceAPI.js';
import '../styles/introduce.css';

function Introduce() {

    const [executives, setExecutives] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const executiveData = await fetchExecutives();
                setExecutives(executiveData.data || []);
            } catch (error) {
                console.error("데이터를 불러오는데 실패했습니다.", error);
            }
        };
        loadInitialData();
    }, []);

    return (
        <div className="back-color">
            <section className="landing-hero">
                <h1 className="hero-title">
                    EMSYS<span className="blink-cursor">_</span>
                </h1>
                <p className="landing-hero-text">The official platform for EMSYS members.
                    <br />Announcements, resources, and schedules — all in one place.
                </p>
                <div className="hero-btn">
                    <button className="landing-code-btn">
                        <i className="fa-solid fa-key"></i> Get Invite Code
                    </button>

                    <button className="home-btn">
                        HOMEPAGE
                    </button>
                </div>
            </section>

            <section className="purpose">
                <div className="purpose-header">
                    <h2 className="purpose-title"><span className="slash-purpose">. /</span> purpose</h2>
                    <hr className="purpose-divider"></hr>
                    <p className="purpose-text">
                        공지, 자료, 일정을 한 곳에서!
                        동아리 활동을 효율적으로 관리하고,<br />
                        신입 부원에게는 정보 창구가 되어주는,<br />
                        부원들이 직접 만들고 함께 채워가는 EMSYS만의 공간입니다.
                    </p>
                </div>
            </section>

            <section className="features-section">
                <div className="home-container">

                    <h2 className="features-title">Feature</h2>

                    <div className="row features-row">
                        <div className="col-sm-3">
                            <div className="features-item">
                                <h4><i className="fa-solid fa-box-archive"></i> 자료 통합 관리</h4>
                                <p>학습자료를 한 곳에 모아 <br /> 카테고리별 관리</p>
                            </div>
                        </div>

                        <div className="col-sm-3">
                            <div className="features-item">
                                <h4><i className="fa-solid fa-users"></i> 커뮤니티</h4>
                                <p>공모전 정보, 팀원 모집, 질문 등 <br /> 다양한 분야의 소통 창구 </p>
                            </div>
                        </div>

                        <div className="col-sm-3">
                            <div className="features-item">
                                <h4><i className="fa-solid fa-comments"></i> 선후배 소통 공간</h4>
                                <p>졸업생과 재학생 모두가 <br /> 활동할 수 있는 공간</p>
                            </div>
                        </div>

                        <div className="col-sm-3">
                            <div className="features-item">
                                <h4><i className="fa-solid fa-shield-halved"></i> 권한별 접근 관리</h4>
                                <p>일반 부원·관리자별 접근 범위 구분을 통한 안전한 운영</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="invite-section">
                <div className="invite-box">

                    <div className="invite-grid-bg"></div>

                    <div className="invite-header">
                        <h2 className="invite-title">초대코드 조회</h2>
                        <p className="invite-subtitle">부원에 한하여 학번과 이름을 입력하면
                            <br />초대코드를 확인할 수 있습니다
                        </p>
                    </div>

                    <div className="invite-input-area">
                        <div className="invite-input-wrapper">
                            <input
                                type="text"
                                placeholder="학번"
                                className="invite-input"
                            />
                        </div>

                        <div className="invite-input-wrapper">
                            <input
                                type="text"
                                placeholder="이름"
                                className="invite-input"
                            />
                        </div>

                        <button className="invite-btn">
                            [ 초대코드 조회 ]
                        </button>
                    </div>

                    {/*초대코드 결과 표시 여따가 하면 됨~*/}

                    <div className="invite-footer">
                        <p className="invite-footer-left">
                            조회가 안 되시나요? <br />
                            동아리 관리자에게 문의하세요.
                        </p>
                    </div>

                </div>
            </section>

            <hr className="outro-divider"></hr>

            <section className="member-section">

                <div className="member-container">
                    <h2 className="member-title"><i className="fa-solid fa-angle-right"></i>project-member</h2>
                    <div className="row member-row">
                        {[
                            { name: "24 심연우", role: "역 할" },
                            { name: "24 이나연", role: "역 할" },
                            { name: "24 정소연", role: "역 할" },
                        ].map((member, index) => (
                            <div key={index} className="col-6 col-sm-4">
                                <div className="member-card">
                                    <h4 className="member-name">{member.name}</h4>
                                    <p className="member-role">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="member-section">
                <div className="member-container">
                    <h2 className="member-title"><i className="fa-solid fa-angle-right"></i>executives</h2>
                    <div className="row member-row">
                        {executives.map((member, index) => (
                            <div key={index} className="col-6 col-sm-4">
                                <div className="member-card">
                                    <h4 className="member-name">{member.name}</h4>
                                    <p className="member-role">{member.position || member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Introduce;