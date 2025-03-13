import React from "react";
import "./HomePage.css";

function HomePage() {
    return (
        <div className="home-container">
            <header className="hero-section">
                {/* <div className="logo">LMS Platform</div> */}
                <h1>Welcome to Our Learning Management System</h1>
                <p>Empowering educators and learners with a seamless online learning experience.</p>
            </header>
            <section className="features-section">
                <h2>Why Choose Our LMS?</h2>
                <div className="feature-list">
                    <div className="feature-item">
                        <h3>📚 Interactive Learning</h3>
                        <p>Engage with interactive courses and track your progress effectively.</p>
                    </div>
                    <div className="feature-item">
                        <h3>🔧 Efficient Management</h3>
                        <p>Admins and owners can easily manage users, books, and requests.</p>
                    </div>
                    <div className="feature-item">
                        <h3>🔒 Secure & Reliable</h3>
                        <p>Your data is protected with top-tier security measures.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;