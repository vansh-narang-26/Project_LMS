import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BsSearch } from 'react-icons/bs';
import "./ReaderDashboard.css"
const ReaderDashboard = () => {
    const token = localStorage.getItem("token")
    // console.log(token)
    const [books, setBooks] = useState([]);
    const [searchVal, setSearchVal] = useState("");



    async function handleSearchClick() {
        if (searchVal === "") { setBooks([]); return; }
        const res = await axios.get(`http://localhost:8000/api/reader/search-books?q=${searchVal}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })
        console.log(res.data.Books)
        setBooks(res.data.Books)
    }
    async function getAllBooks() {
        //Got all books to display
        const res = await axios.get("http://localhost:8000/api/reader/getBooks", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })
        //console.log(res.data.Books)
        setBooks(res.data.Books)
        // console.log(books)
    }

    async function raiseRequest(e, book) {
        console.log(book.isbn);
        const res = await axios.get(`http://localhost:8000/api/reader/raise-request/${book.isbn}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }

        )
        console.log(res)
    }
    useEffect(() => {
        getAllBooks()
        // raiseRequest()
    }, [])
    // const mystyle = {
    //     marginLeft: "600px",
    //     marginTop: "20px",
    //     fontWeight: "700"
    // };
    return (
        <div className='reader-dashboard'>
            <h1 className="reader-title">Reader Dashboard</h1>
            <div className='button-container'>

                <div className='search-container'>
                    <input onChange={e => setSearchVal(e.target.value)} placeholder='Search for author, title, publisher'>
                    </input>
                    <BsSearch onClick={handleSearchClick} />
                </div>

                <div className='book-container'>
                    {books.map((product) => {
                        return (
                            <div key={product.isbn} className='book-list-container'>
                                {product.title} by {product.authors} published by {product.publisher}
                                <button className='issue-button' onClick={(e) => raiseRequest(e, product)}>Issue</button>
                            </div>
                        )
                    })
                    }
                </div>
            </div>
        </div>
    )
}

export default ReaderDashboard