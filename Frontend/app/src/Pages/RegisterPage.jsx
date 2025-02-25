import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegisterPage.css";

const API_URL = "http://localhost:8000/api/users/register";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact_no: "",
        role: "", 
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        try {
            const response = await axios.post(API_URL, formData);
            console.log("Registration Success:", response.data);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000); // Redirect after 2 sec
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register</h2>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Registration Successful! Redirecting...</p>}

                <div className="input-group">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Contact No.</label>
                    <input
                        type="text"
                        name="contact_no"
                        placeholder="Enter your contact number"
                        value={formData.contact_no}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Role</label>
                    <select
                        name="role"
                        placeholder="Enter your role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select a role</option>
                        <option value="owner">Owner</option>
                        <option value="reader">Reader</option>
                    </select>
                </div>
                <button type="submit">Register</button>
                <p>Already Have an account ? <Link to={"/login"}>Login</Link></p>
            </form>
        </div>
    );
};

export default RegisterPage;