import React from 'react'
import "./Navbar.css"
import { useNavigate ,NavLink} from 'react-router-dom'
const Navbar = ({ onLogout }) => {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <a href="/" className="logo">
                    Learning Managment System
                </a>
            </div>
            <div className="navbar-center">
                <ul className="nav-links">
                    <li>
                        {token ? (
                            <button className="uppercase" onClick={()=>onLogout(navigate)}>
                                Log out
                            </button>
                        ) : (
                            <NavLink className="" to="/login">
                                Log in
                            </NavLink>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar