import axios from "axios";
import React, { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom"
import toast, { Toaster } from 'react-hot-toast';
import "./OwnerDashboard.css";

// const notify = () => toast("Welcome to GeeksforGeeks");

// const success = () =>
//     toast.success("Successfully registered");

// const error = () => toast.error("Oops! An error occurred.");


const OwnerDashboard = () => {
    // const navigate = useNavigate();
    const token = localStorage.getItem("token");
    // const cookie=Cookies.get("Authorization")
    // console.log(cookie)
    // console.log("Token is",token)
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [libraryName, setLibraryName] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminContact, setAdminContact] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [libraryId, setLibraryId] = useState()
    const [libraryData, setLibraryData] = useState([])
    const [admins, setAdmins] = useState([])

    const handleLibraryClick = () => {
        setShowLibraryModal(true);
    };

    const closeLibraryModal = () => {
        setShowLibraryModal(false);
        setLibraryName("");
        setError("");
    };

    const handleAdminClick = () => {
        setShowAdminModal(true);
    };

    const closeAdminModal = () => {
        setShowAdminModal(false);
        setAdminName("");
        setAdminEmail("");
        setAdminContact("");
        setError("");
    };

    const handleCreateLibrary = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8000/api/library/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                // credentials: "include",
                body: JSON.stringify({ name: libraryName }),
            });

            const data = await response.json();
            console.log(data)
            if (!response.ok) throw new Error(data.Error || "Failed to create library");

            // alert("Library created successfully!");
            toast.success("Library created successfully!");
            closeLibraryModal();
            //   navigate("/owner-dashboard")
            fetchLibs()
        } catch (err) {
            toast.error(err.message)
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8000/api/library/create-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`

                },
                // credentials: "include",
                body: JSON.stringify({
                    name: adminName,
                    email: adminEmail,
                    contact_no: adminContact,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to create admin");

            toast.success('Admin created Successfully!');
            //  alert("Admin created successfully!");
            closeAdminModal();

            // window.location.reload();
            getAdmins()
        } catch (err) {
            toast.error(err.message)
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    async function fetchLibs() {
        console.log(token)
        const response = await axios.get("http://localhost:8000/api/library/getlib", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            // credentials: "include",
        })


        // console.log(response.data.library[0].id)
        setLibraryData([response.data?.library])
        console.log(response.data.library)
        setLibraryId(response.data?.library)
        // console.log(libraryData)
        // const res=await fetch("http://localhost:8000/api/library/getlib",
        //     {
        //         method: "GET",
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': token
        //           },
        //           credentials: "include",
        //     }
        // )
        // console.log(res)
        // const json = await res.json();
        // console.log(json.library);
        // setLibraryId(json.library.id)
        // setLibraryData(json.library)


        //console.log(getLibraries)
        // setLibrary(getLibraries)
    }

    async function getAdmins() {
        // console.log(token)
        const res = await axios.get("http://localhost:8000/api/library/getAdmins", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })
        console.log(res.data.admins)
        setAdmins(res.data.admins)
    }
    useEffect(() => {
        fetchLibs()
        getAdmins()
    }, [])

    return (
        <div className="owner-dashboard">
            {/* {libraryId} */}
            <h1 className="dashboard-title1">Welcome Owner</h1>
            <h1 className="dashboard-title">Your Libraries</h1>
            <div className="button-container1">
                {!libraryId && (<button className="create-library" onClick={handleLibraryClick}>Create Library</button>)}
                {/* <button onClick={() => onLogout(navigate)}>Logout</button> */}
            </div>


            {showLibraryModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Create Library</h2>
                        {error && <p className="error">{error}</p>}
                        <form onSubmit={handleCreateLibrary}>
                            <label>Library Name:</label>
                            <input
                                type="text"
                                placeholder="Enter library name"
                                value={libraryName}
                                onChange={(e) => setLibraryName(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Submit"}</button>
                            <button type="button" onClick={closeLibraryModal}>Close</button>
                        </form>
                    </div>
                </div>
            )}

            {showAdminModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Create Admin</h2>
                        {error && <p className="error">{error}</p>}
                        <form onSubmit={handleCreateAdmin}>
                            <label>Name:</label>
                            <input
                                type="text"
                                placeholder="Enter admin name"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                required
                            />
                            <label>Email:</label>
                            <input
                                type="email"
                                placeholder="Enter admin email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                required
                            />
                            <label>Contact Number:</label>
                            <input
                                type="text"
                                placeholder="Enter contact number"
                                value={adminContact}
                                onChange={(e) => setAdminContact(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Submit"}</button>
                            <button type="button" onClick={closeAdminModal}>Close</button>
                        </form>
                    </div>
                </div>
            )}
            <div className="library-container">
                {libraryData.map((lib, index) => (
                    <div key={index} className="library-card">
                        <p>Name: {lib.name}</p>
                        <p>ID: {lib.id}</p>
                        <p>Has {admins.length} admin(s)</p>
                        {libraryId && (<button className="create-admin" onClick={handleAdminClick}>Create Admin</button>)}
                    </div>
                ))}
            </div>
            <h1 className="dashboard-title">Library Admins</h1>
            <div className="admin-container1">
                {admins.length > 0 && admins.map((admin, index) => (
                    <div key={index} className="admin-card">
                        <p>Name: {admin.name}</p>
                        <p>Email: {admin.email}</p>
                        <p>Contact: {admin.contact_no}</p>
                    </div>
                ))}
            </div>
            <Toaster
                position="top-center"
                reverseOrder={true}
            />
        </div>
    );
};

export default OwnerDashboard;