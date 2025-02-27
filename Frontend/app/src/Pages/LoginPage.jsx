import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LoginPage.css";
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const role = localStorage.getItem("role");
            redirectBasedOnRole(role);
        }
    }, []);

    const redirectBasedOnRole = (role) => {
        switch (role) {
            case "admin":
                navigate("/admin-dashboard");
                break;
            case "owner":
                navigate("/owner-dashboard");
                break;
            default:
                navigate("/reader-dashboard");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:8000/api/users/login",
                { email },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            // Show success message
            toast.success("Logged in successfully");

            // Store auth data
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            // Redirect based on role
            setTimeout(() => redirectBasedOnRole(response.data.role), 1000);

        } catch (error) {
            console.error("Login error:", error);

            if (error.response?.data?.Error) {
                setError(error.response.data.Error);
            } else {
                setError("Unable to connect to the server. Please try again later.");
            }

            toast.error("Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {error && <p className="error" role="alert">{error}</p>}

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-required="true"
                    />
                </div>

                <div className="links">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={isLoading ? "loading" : ""}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            <Toaster
                position="top-center"
                reverseOrder={true}
            />
        </div>
    );
};

export default Login;