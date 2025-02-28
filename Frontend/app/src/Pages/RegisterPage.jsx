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
        lib_id: "",
    });

    const [libraries, setLibraries] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLibraries = async () => {
            try {
                const response = await axios.get(LIBRARIES_API);
                setLibraries(response.data.libraries);
            } catch (err) {
                console.error("Error fetching libraries:", err);
                toast.error("Could not fetch libraries");
            }
        };

        fetchLibraries();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle role change separately
        if (name === 'role') {
            setFormData({
                ...formData,
                [name]: value,
                // Set lib_id to 0 when role is owner
                lib_id: value === 'owner' ? 0 : formData.lib_id
            });
        } else {
            setFormData({
                ...formData,
                [name]: name === 'lib_id' ? parseInt(value) : value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setIsLoading(true);

        try {
            const response = await axios.post(API_URL, formData);
            console.log("Registration Success:", response);
            toast.success("Registration Successful");
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000); // Redirect after 2 sec
        } catch (err) {
           // console.log(err)
            const errorMessage = err.response?.data?.Error || "Registration failed";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Create Your Account</h2>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Registration Successful! Redirecting...</p>}

                <div className="input-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="contact_no">Contact Number</label>
                    <input
                        id="contact_no"
                        type="text"
                        name="contact_no"
                        placeholder="Enter your contact number"
                        value={formData.contact_no}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="role">Select Role</label>
                    <select
                        id="role"
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

                {/* Showing Library only if role is reader */}
                {formData.role === "reader" && (
                    <div className="input-group">
                        <label htmlFor="lib_id">Select Library</label>
                        <select
                            id="lib_id"
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

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Register"}
                </button>

                <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />
        </div>
    );
};

export default RegisterPage;