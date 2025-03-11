import React, { useState } from 'react';
import "./Navbar.css";
import { useNavigate, NavLink } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get user role from token
    const getUserRole = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.role;
        } catch (error) {
            console.error("Invalid token", error);
            return null;
        }
    };

    const userRole = getUserRole();

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <NavLink to="/" className="logo">
                        Learning Management System
                    </NavLink>
                </div>

                {token && (
                    <div className="navbar-center">
                        <button className="menu-button" onClick={toggleSidebar}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>

                        <ul className="nav-links desktop-nav">
                            {userRole === "owner" && (
                                <>
                                    <li><NavLink to="/owner-dashboard">Dashboard</NavLink></li>
                                    {/* <li><NavLink to="/manage-libraries">My Libraries</NavLink></li>
                                    <li><NavLink to="/manage-admins">Manage Admins</NavLink></li> */}
                                </>
                            )}

                            {userRole === "admin" && (
                                <>
                                    <li><NavLink to="/admin-dashboard">Dashboard</NavLink></li>
                                    {/* <li><NavLink to="/manage-books">Manage Books</NavLink></li>
                                    <li><NavLink to="/issue-requests">Issue Requests</NavLink></li> */}
                                </>
                            )}

                            {userRole === "reader" && (
                                <>
                                    <li><NavLink to="/reader-dashboard">Dashboard</NavLink></li>
                                    {/* <li><NavLink to="/search-books">Find Books</NavLink></li>
                                    <li><NavLink to="/my-books">My Books</NavLink></li>
                                    <li><NavLink to="/issue-history">Issue History</NavLink></li> */}
                                </>
                            )}
                        </ul>
                    </div>
                )}

                <div className="navbar-right">
                    {token ? (
                        <button className="logout-button" onClick={() => onLogout(navigate)}>
                            Log out
                        </button>
                    ) : (
                        <>
                            <NavLink className="register-button" to="/register">
                                Register
                            </NavLink>
                            <NavLink className="login-button" to="/login">
                                Log in
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={toggleSidebar}>
                    <div className="sidebar" onClick={(e) => e.stopPropagation()}>
                        <div className="sidebar-header">
                            <h3>Menu</h3>
                            <button className="close-button" onClick={toggleSidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="sidebar-content">
                            {userRole === "owner" && (
                                <ul className="sidebar-links">
                                    <li><NavLink to="/owner-dashboard" onClick={toggleSidebar}>Dashboard</NavLink></li>
                                    {/* <li><NavLink to="/manage-libraries" onClick={toggleSidebar}>My Libraries</NavLink></li>
                                    <li><NavLink to="/manage-admins" onClick={toggleSidebar}>Manage Admins</NavLink></li> */}
                                </ul>
                            )}

                            {userRole === "admin" && (
                                <ul className="sidebar-links">
                                    <li><NavLink to="/admin-dashboard" onClick={toggleSidebar}>Dashboard</NavLink></li>
                                    {/* <li><NavLink to="/manage-books" onClick={toggleSidebar}>Manage Books</NavLink></li>
                                    <li><NavLink to="/issue-requests" onClick={toggleSidebar}>Issue Requests</NavLink></li>
                                    <li><NavLink to="/reader-management" onClick={toggleSidebar}>Manage Readers</NavLink></li> */}
                                </ul>
                            )}

                            {userRole === "reader" && (
                                <ul className="sidebar-links">
                                    <li><NavLink to="/reader-dashboard" onClick={toggleSidebar}>Dashboard</NavLink></li>
                                    {/* <li><NavLink to="/search-books" onClick={toggleSidebar}>Find Books</NavLink></li>
                                    <li><NavLink to="/my-books" onClick={toggleSidebar}>My Books</NavLink></li>
                                    <li><NavLink to="/issue-history" onClick={toggleSidebar}>Issue History</NavLink></li> */}
                                </ul>
                            )}

                            <div className="sidebar-footer">
                                <button className="logout-button-sidebar" onClick={() => {
                                    onLogout(navigate);
                                    toggleSidebar();
                                }}>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;