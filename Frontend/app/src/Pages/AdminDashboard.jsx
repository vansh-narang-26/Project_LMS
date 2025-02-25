import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css"
const AdminDashboard = () => {
    const token = localStorage.getItem("token");
    const [books, setBooks] = useState([]);
    const [requests, setRequests] = useState([]);
    const [showUpdatedModal, setShowUpdateModal] = useState(false);
    const [title, setTitle] = useState("")
    const [authors, setAuthors] = useState("")
    const [publisher, setPublisher] = useState("")
    const [version, setVersion] = useState("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updateisbn, setupdateisbn] = useState();
    // const [newBook, setNewBook] = useState({ title: "", author: "", year: "" });

    const handleUpdateBook = (id) => {
        setupdateisbn(id)
        setShowUpdateModal(true);
    };
    const closeUpdatedBook = () => {
        setShowUpdateModal(false);
        setError("");

    };
    useEffect(() => {
        fetchBooks();
        fetchRequests();
    }, []);

    const [bookDetails, setBookDetails] = useState({
        isbn: "",
        title: "",
        authors: "",
        publisher: "",
        version: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookDetails({
            ...bookDetails,
            [name]: name === "version" ? Number(value) : value, // Convert version to number
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/api/admin/add-book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bookDetails)
            });
            console.log(response.status)
            if (response.status == 400) {
                alert("failed to add book as it already exists")
                return
            }
            const data = await response.json();
            console.log(data)
            alert("Book added successfully!");
            fetchBooks()
        } catch (error) {
            console.error("Error adding book:", error);
            alert("Failed to add book");
        }
    };
    const fetchBooks = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/admin/getBooks",
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Beader ${token}`
                    }
                }
            );
            setBooks(response.data.Books);
            console.log(response.data.Books)
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/admin/list-requests",
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                }
            );
            console.log(response.data.message);
            setRequests(response.data.message);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };
    const removeBook = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/admin/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            fetchBooks();
        } catch (error) {
            console.error("Error removing book:", error);
        }
    };

    const approveRequest = async (id) => {
        try {
            await axios.put(`http://localhost:8000/api/admin/${id}/approve`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            fetchRequests();
        } catch (error) {
            console.error("Error approving request:", error);
        }
    };

    const rejectRequest = async (id) => {
        try {
            await axios.post(`/api/requests/${id}/reject`);
            fetchRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };
    const handleSubmission = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:8000/api/admin/${updateisbn}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                // credentials: "include",
                body: JSON.stringify({ title: title, authors: authors, publisher: publisher, version: Number(version) }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update book");

            alert("Book updated successfully!");
            closeUpdatedBook();
            fetchBooks()
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>

            <h2>Admin Dashboard - Add Book</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="isbn" placeholder="ISBN" onChange={handleChange} required />
                <input type="text" name="title" placeholder="Title" onChange={handleChange} required />
                <input type="text" name="authors" placeholder="Authors" onChange={handleChange} required />
                <input type="text" name="publisher" placeholder="Publisher" onChange={handleChange} required />
                <input type="number" name="version" placeholder="Version" onChange={handleChange} required />
                <button type="submit">Add Book</button>
            </form>
            <h2>List Books</h2>
            {showUpdatedModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Update Book</h2>
                        {error && <p className="error">{error}</p>}
                        <form onSubmit={handleSubmission}>
                            <input
                                type="text"
                                placeholder="Enter Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Enter Author"
                                value={authors}
                                onChange={(e) => setAuthors(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Enter Publisher"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Enter Version"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Submit"}</button>
                            <button type="button" onClick={closeUpdatedBook}>Close</button>
                        </form>
                    </div>
                </div>
            )}

            <ul className="ul-list">
                {books.map((book) => (
                    <li key={book.isbn} className="li-list">
                        <div className="li-list-div">
                            <p>Title {book.title} </p>
                            <p>Author {book.authors}</p>
                            <p>Version {book.version}</p>
                        </div>
                        <button onClick={() => handleUpdateBook(book.isbn)}>Update</button>
                        <button onClick={() => removeBook(book.isbn)}>Remove</button>
                    </li>
                ))}
            </ul>

            <h2>Manage Requests</h2>
            <ul>
                {requests.map((req, index) => (
                    <li key={index}>
                        {req.reader_id} requested {req.book_id}
                        <button onClick={() => approveRequest(req.req_id)}>Approve</button>
                        <button onClick={() => rejectRequest(req.req_id)}>Reject</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;