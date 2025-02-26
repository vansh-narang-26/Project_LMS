import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import "./RegisterPage.css";

const API_URL = "http://localhost:8000/api/users/register";
const LIBRARIES_API = "http://localhost:8000/api/getLib";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact_no: "",
        role: "",
        lib_id: "" || 0,
    });

    const [libraries, setLibraries] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLibraries = async () => {
            try {
                const response = await axios.get(LIBRARIES_API);
                console.log(response)
                setLibraries(response.data.libraries);
            } catch (err) {
                console.error("Error fetching libraries:", err);
            }
        };

        fetchLibraries();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
            [e.target.name]: e.target.name === 'lib_id' ? parseInt(e.target.value) : e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        try {
            const response = await axios.post(API_URL, formData);
            console.log("Registration Success:", response.data);
            toast.success("Registration Successful")
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
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select a role</option>
                        <option value="owner">Owner</option>
                        <option value="reader">Reader</option>
                    </select>
                </div>

                {/* Showing Library only if role is "reader" */}
                {formData.role === "reader" && (
                    <div className="input-group">
                        <label>Library</label>
                        <select
                            name="lib_id"
                            value={formData.lib_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select a library</option>
                            {libraries.map((library) => (
                                <option key={library.id} value={library.id}>
                                    {library.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button type="submit">Register</button>
                <p>Already have an account? <Link to={"/login"}>Login</Link></p>
            </form>
            <Toaster
                position="top-center"
                reverseOrder={true}
            />
        </div>
    );
};

export default RegisterPage;