import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BsSearch } from 'react-icons/bs';
import "./ReaderDashboard.css"
import toast, { Toaster } from 'react-hot-toast';
const ReaderDashboard = () => {
    const token = localStorage.getItem("token")
    // console.log(token)
    const [books, setBooks] = useState([]);
    const [allBook, setallBooks] = useState([])
    const [searchVal, setSearchVal] = useState("");


    async function getReturnDate(e, book) {
        console.log(book.isbn)
        try {
            const res = await axios.get(`http://localhost:8000/api/reader/return-date/${book.isbn}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            })
            const expectedDate = new Date(res.data.return_date).toLocaleDateString()
            // console.log(res.data.return_date)
            toast(expectedDate,{
                duration:4000,
            });
        } catch (error) {
            console.log(error)
        }
    }

    async function handleSearchClick() {
        //couldnt show toast here
        if (searchVal === "") {
            setBooks([]);
            return;
        }
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
        setallBooks(res.data.Books)
        // console.log(books)
    }

    async function raiseRequest(e, book) {
        console.log(book.isbn);
        try {
            const res = await axios.get(`http://localhost:8000/api/reader/raise-request/${book.isbn}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            })
            console.log(res.data)
            toast.success("Book has been requested")
        } catch (error) {
            toast.error(error.response.data.Message)
            console.log(error.response.data.Message)
        }

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
        <>
            <div className='reader-dashboard'>
                <h1 className="">Reader Dashboard</h1>
                <div className='button-container'>

                    <div className='search-container'>
                        <input onChange={e => setSearchVal(e.target.value)} placeholder='Search for author, title, publisher'>
                        </input>
                        <BsSearch onClick={handleSearchClick} />
                    </div>

                    <div className='book-container'>
                        <ul className='ul-list-book'>
                            {books.map((book) => (
                                // <div key={product.isbn} className='book-list-container'>
                                //     {product.title} by {product.authors} published by {product.publisher} in Lib {product.lib_id}
                                //     <button className='issue-button' onClick={(e) => raiseRequest(e, product)}>Issue</button>
                                // </div>

                                <li key={book.isbn} className='li-list-book'>
                                    <div className='li-list-div-book'>
                                        <p>Available copies {book.available_copies}</p>
                                        <p>Title {book.title} </p>
                                        <p>Author {book.authors}</p>
                                        <p>Version {book.version}</p>
                                        {book.available_copies < 1 ? (<button onClick={(e) => getReturnDate(e, book)}>Expected Date</button>) : ""}
                                        <button className='' onClick={(e) => raiseRequest(e, book)}>Request</button>
                                    </div>
                                </li>
                            ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
            <h1 className='heading'>Recently added books</h1>
            <ul className="ul-list-book">
                {allBook.map((book) => (
                    <li key={book.isbn} className="li-list-book">
                        <div className="li-list-div-book">
                            <p>Available copies {book.available_copies}</p>
                            <p>Title {book.title} </p>
                            <p>Author {book.authors}</p>
                            <p>Version {book.version}</p>
                        </div>
                        {book.available_copies < 1 ? (<button onClick={(e) => getReturnDate(e, book)}>Expected Date</button>) : ""}
                        <button className='' onClick={(e) => raiseRequest(e, book)}>Request Book</button>
                    </li>
                ))}
            </ul>
            <Toaster
                position="top-center"
                reverseOrder={true}
            />
        </>
    )
}

export default ReaderDashboard