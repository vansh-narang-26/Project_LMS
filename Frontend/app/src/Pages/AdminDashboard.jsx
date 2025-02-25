import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css"
const AdminDashboard = () => {
    const token = localStorage.getItem("token");
    const [books, setBooks] = useState([]);
    const [requests, setRequests] = useState([]);
    // const [newBook, setNewBook] = useState({ title: "", author: "", year: "" });

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
            const data = await response.json();
            alert("Book added successfully!");
        } catch (error) {
            console.error("Error adding book:", error);
            alert("Failed to add book");
        }
    };
    const fetchBooks = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/admin/getBooks",
                {
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":`Beader ${token}`
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
            await axios.delete(`/api/books/${id}`);
            fetchBooks();
        } catch (error) {
            console.error("Error removing book:", error);
        }
    };

    const approveRequest = async (id) => {
        try {
            await axios.put(`http://localhost:8000/api/admin/${id}/approve`,{},{
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
            <ul>
                {books.map((book) => (
                    <li key={book.isbn}>
                        {book.title} by {book.authors} {book.version}
                        {/* <button onClick={() => removeBook(book.id)}>Remove</button> */}
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