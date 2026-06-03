import { useState, useEffect } from "react";
import '../styles/landing.css';

function LandingPage() {
    return (
        <>
            <div className="landing-hero">
                <h1 className="hero-title">
                    EMSYS<span className="blink-cursor">_</span>
                </h1>
                <p className="lading-hero-text">The official platform for EMSYS members.
                    Announcements, resources, and schedules — all in one place.
                </p>
                <div className="invite-code">
                    <button className="">
                        
                    </button>
                </div>
            </div>

        </>
    );
}

export default LandingPage;