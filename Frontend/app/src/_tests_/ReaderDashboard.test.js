// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { MemoryRouter } from "react-router-dom";
// import axios from "axios";
// import ReaderDashboard from "../Pages/ReaderDashboard";
// import React from "react";
// import "@testing-library/jest-dom";
// import toast from "react-hot-toast";

// // Mock dependencies
// jest.mock("axios");
// jest.mock("react-hot-toast", () => ({
//     __esModule: true,
//     default: jest.fn((message) => message),
//     success: jest.fn(),
//     error: jest.fn(),
//     Toaster: () => <div data-testid="toast-container" />
// }));

// // Mock localStorage
// const mockLocalStorage = (() => {
//     let store = {};
//     return {
//         getItem: jest.fn(key => store[key] || "mock-token"),
//         setItem: jest.fn((key, value) => {
//             store[key] = value;
//         }),
//         clear: jest.fn(() => {
//             store = {};
//         })
//     };
// })();

// Object.defineProperty(window, "localStorage", {
//     value: mockLocalStorage,
//     writable: true
// });

// // Mock react-icons
// jest.mock("react-icons/bs", () => ({
//     BsSearch: () => <div data-testid="search-icon" />
// }));

// describe("ReaderDashboard Component", () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//         mockLocalStorage.getItem.mockReturnValue("mock-token");
//     });

//     test("renders reader dashboard with correct title", () => {
//         // Mock API response
//         axios.get.mockResolvedValueOnce({ data: { Books: [] } });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         expect(screen.getByText("Reader Dashboard")).toBeInTheDocument();
//         expect(screen.getByText("Recently added books")).toBeInTheDocument();
//     });

//     test("fetches and displays recently added books", async () => {
//         const mockBooks = [
//             {
//                 isbn: "1234567890",
//                 title: "Test Book",
//                 authors: "Test Author",
//                 version: "1.0",
//                 available_copies: 5
//             }
//         ];

//         axios.get.mockResolvedValueOnce({ data: { Books: mockBooks } });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Wait for the books to be displayed
//         await waitFor(() => {
//             expect(screen.getByText("Title Test Book")).toBeInTheDocument();
//             expect(screen.getByText("Author Test Author")).toBeInTheDocument();
//             expect(screen.getByText("Version 1.0")).toBeInTheDocument();
//             expect(screen.getByText("Available copies 5")).toBeInTheDocument();
//         });

//         // Verify API was called correctly
//         expect(axios.get).toHaveBeenCalledWith(
//             "http://localhost:8000/api/reader/getBooks",
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer mock-token"
//                 }
//             }
//         );
//     });

//     test("performs search and displays search results", async () => {
//         // Mock initial books load
//         axios.get.mockResolvedValueOnce({ data: { Books: [] } });

//         // Mock search results
//         const searchResults = [
//             {
//                 isbn: "9876543210",
//                 title: "Search Result Book",
//                 authors: "Search Author",
//                 version: "2.0",
//                 available_copies: 3
//             }
//         ];
//         axios.get.mockResolvedValueOnce({ data: { Books: searchResults } });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Enter search value
//         const searchInput = screen.getByPlaceholderText("Search for author, title, publisher");
//         await userEvent.type(searchInput, "search term");

//         // Click search button
//         const searchButton = screen.getByTestId("search-icon");
//         fireEvent.click(searchButton);

//         // Wait for search results to be displayed
//         await waitFor(() => {
//             expect(screen.getByText("Title Search Result Book")).toBeInTheDocument();
//             expect(screen.getByText("Author Search Author")).toBeInTheDocument();
//             expect(screen.getByText("Version 2.0")).toBeInTheDocument();
//             expect(screen.getByText("Available copies 3")).toBeInTheDocument();
//         });

//         // Verify search API was called correctly
//         expect(axios.get).toHaveBeenCalledWith(
//             "http://localhost:8000/api/reader/search-books?q=search term",
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer mock-token"
//                 }
//             }
//         );
//     });

//     test("handles empty search input", async () => {
//         // Mock initial books load
//         axios.get.mockResolvedValueOnce({ data: { Books: [] } });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Don't enter any search value
//         const searchInput = screen.getByPlaceholderText("Search for author, title, publisher");
//         await userEvent.clear(searchInput);

//         // Click search button
//         const searchButton = screen.getByTestId("search-icon");
//         fireEvent.click(searchButton);

//         // Verify search API was not called
//         expect(axios.get).not.toHaveBeenCalledWith(
//             expect.stringContaining("search-books"),
//             expect.any(Object)
//         );
//     });

//     test("raises request for a book successfully", async () => {
//         const mockBooks = [
//             {
//                 isbn: "1234567890",
//                 title: "Test Book",
//                 authors: "Test Author",
//                 version: "1.0",
//                 available_copies: 5
//             }
//         ];

//         // Mock initial books load
//         axios.get.mockResolvedValueOnce({ data: { Books: mockBooks } });

//         // Mock raise request response
//         axios.get.mockResolvedValueOnce({ data: { message: "Book requested successfully" } });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Wait for books to be displayed
//         await waitFor(() => {
//             expect(screen.getByText("Title Test Book")).toBeInTheDocument();
//         });

//         // Click on request button
//         const requestButton = screen.getByText("Request Book");
//         fireEvent.click(requestButton);

//         // Wait for success toast
//         await waitFor(() => {
//             expect(toast.success).toHaveBeenCalledWith("Book has been requested");
//         });

//         // Verify API was called correctly
//         expect(axios.get).toHaveBeenCalledWith(
//             "http://localhost:8000/api/reader/raise-request/1234567890",
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer mock-token"
//                 }
//             }
//         );
//     });

//     test("handles error when raising request for a book", async () => {
//         const mockBooks = [
//             {
//                 isbn: "1234567890",
//                 title: "Test Book",
//                 authors: "Test Author",
//                 version: "1.0",
//                 available_copies: 5
//             }
//         ];

//         // Mock initial books load
//         axios.get.mockResolvedValueOnce({ data: { Books: mockBooks } });

//         // Mock raise request error
//         const errorMessage = "Book already requested";
//         axios.get.mockRejectedValueOnce({
//             response: {
//                 data: { Message: errorMessage }
//             }
//         });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Wait for books to be displayed
//         await waitFor(() => {
//             expect(screen.getByText("Title Test Book")).toBeInTheDocument();
//         });

//         // Click on request button
//         const requestButton = screen.getByText("Request Book");
//         fireEvent.click(requestButton);

//         // Wait for error toast
//         await waitFor(() => {
//             expect(toast.error).toHaveBeenCalledWith(errorMessage);
//         });
//     });

//     test("shows expected return date for books with zero available copies", async () => {
//         const mockBooks = [
//             {
//                 isbn: "1234567890",
//                 title: "Test Book",
//                 authors: "Test Author",
//                 version: "1.0",
//                 available_copies: 0
//             }
//         ];

//         // Mock initial books load
//         axios.get.mockResolvedValueOnce({ data: { Books: mockBooks } });

//         // Mock return date response
//         const returnDate = "2025-03-20";
//         axios.get.mockResolvedValueOnce({
//             data: { return_date: returnDate }
//         });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Wait for books to be displayed
//         await waitFor(() => {
//             expect(screen.getByText("Title Test Book")).toBeInTheDocument();
//             expect(screen.getByText("Available copies 0")).toBeInTheDocument();
//         });

//         // Check if Expected Date button is shown
//         const expectedDateButton = screen.getByText("Expected Date");
//         expect(expectedDateButton).toBeInTheDocument();

//         // Click on Expected Date button
//         fireEvent.click(expectedDateButton);

//         // Wait for toast with return date
//         await waitFor(() => {
//             // The actual format will depend on the local date format, so we're just checking for toast call
//             expect(toast).toHaveBeenCalled();
//         });

//         // Verify API was called correctly
//         expect(axios.get).toHaveBeenCalledWith(
//             "http://localhost:8000/api/reader/return-date/1234567890",
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer mock-token"
//                 }
//             }
//         );
//     });

//     test("does not show Expected Date button for books with available copies", async () => {
//         const mockBooks = [
//             {
//                 isbn: "1234567890",
//                 title: "Test Book",
//                 authors: "Test Author",
//                 version: "1.0",
//                 available_copies: 5
//             }
//         ];

//         // Mock initial books load
//         axios.get.mockResolvedValueOnce({ data: { Books: mockBooks } });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Wait for books to be displayed
//         await waitFor(() => {
//             expect(screen.getByText("Title Test Book")).toBeInTheDocument();
//             expect(screen.getByText("Available copies 5")).toBeInTheDocument();
//         });

//         // Verify Expected Date button is not shown
//         expect(screen.queryByText("Expected Date")).not.toBeInTheDocument();
//     });

//     test("displays search results and recently added books separately", async () => {
//         // Mock recently added books
//         const recentlyAddedBooks = [
//             {
//                 isbn: "1234567890",
//                 title: "Recent Book",
//                 authors: "Recent Author",
//                 version: "1.0",
//                 available_copies: 5
//             }
//         ];

//         // Mock search results
//         const searchResults = [
//             {
//                 isbn: "9876543210",
//                 title: "Search Result Book",
//                 authors: "Search Author",
//                 version: "2.0",
//                 available_copies: 3
//             }
//         ];

//         // Mock initial books load
//         axios.get.mockResolvedValueOnce({ data: { Books: recentlyAddedBooks } });

//         // Mock search response
//         axios.get.mockResolvedValueOnce({ data: { Books: searchResults } });

//         render(
//             <MemoryRouter>
//                 <ReaderDashboard />
//             </MemoryRouter>
//         );

//         // Wait for recently added books to be displayed
//         await waitFor(() => {
//             expect(screen.getByText("Title Recent Book")).toBeInTheDocument();
//         });

//         // Perform search
//         const searchInput = screen.getByPlaceholderText("Search for author, title, publisher");
//         await userEvent.type(searchInput, "search term");

//         const searchButton = screen.getByTestId("search-icon");
//         fireEvent.click(searchButton);

//         // Wait for search results to be displayed
//         await waitFor(() => {
//             // Both recently added books and search results should be visible
//             expect(screen.getByText("Title Search Result Book")).toBeInTheDocument();
//             expect(screen.getByText("Title Recent Book")).toBeInTheDocument();
//         });
//     });
// });