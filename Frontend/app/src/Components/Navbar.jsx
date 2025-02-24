import React from 'react'
import "./Navbar.css"
const Navbar = () => {
    return (
            <nav className="navbar">
                <div className="navbar-left">
                    <a href="/" className="logo">
                        Learning Managment System
                    </a>
                </div>
                {/* <div className="navbar-center">
                    <ul className="nav-links">
                        <li>
                            <a href="/login">Login</a>
                        </li>
                        <li>
                            <a href="/logout">Logout</a>
                        </li>
                    </ul>
                </div> */}
            </nav>
    )
}

export default Navbar