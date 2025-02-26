import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css"
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate()
    // if (!role){
    //     navigate("/")
    // }
    const [email, setEmail] = useState("");
    //   const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSuccess(false);

        try {
            const response = await axios.post("http://localhost:8000/api/users/login",
                {
                    email,
                },
            );

            setMessage("Logged in successfully!");
            toast.success("Logged in successfully")
            console.log("Login response", response)
            setSuccess(true);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            // Redirect based on role (optional)
            if (response.data.role === "admin") {
                setTimeout(() => navigate("/admin-dashboard"), 2000);
                //  window.location.href = "/admin-dashboard";
            } else if (response.data.role === "owner") {
                setTimeout(() => navigate("/owner-dashboard"), 2000);
               // window.location.href = "/owner-dashboard";
            } else {
                setTimeout(() => navigate("/reader-dashboard"), 2000);
              //  window.location.href = "/dashboard";
            }
        } catch (error) {
            console.log(error.response)
            setError(error.response?.data?.Error || "Login failed. Try again.");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {error && <p className="error">{error}</p>}
                {success && <p className="success-message">Login Successful! Redirecting...</p>}

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
            <Toaster
                position="top-center"
                reverseOrder={true}
            />
        </div>
    );
};

export default Login;