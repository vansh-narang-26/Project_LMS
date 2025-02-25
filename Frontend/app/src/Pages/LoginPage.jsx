import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css"
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    // const navigate=useNavigate()
    // if (!role){
    //     navigate("/")
    // }
    const [email, setEmail] = useState("");
    //   const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const response = await axios.post("http://localhost:8000/api/users/login",
                {
                    email,
                },
            );

            setMessage("Logged in successfully!");
            console.log("Login response", response)
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            // Redirect based on role (optional)
            if (response.data.role === "admin") {
                window.location.href = "/admin-dashboard";
            } else if (response.data.role === "owner") {
                window.location.href = "/owner-dashboard";
            } else {
                window.location.href = "/dashboard";
            }
        } catch (error) {
            setError(error.response?.data?.Error || "Login failed. Try again.");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}

                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <p>Don't have an account ? <Link to={"/"}>Register</Link></p>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;