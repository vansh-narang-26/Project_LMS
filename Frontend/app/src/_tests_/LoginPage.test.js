// import { render, screen, waitFor, fireEvent } from "@testing-library/react";
// import Login from "../Pages/LoginPage";
// import React from "react";
// import { MemoryRouter as Router } from "react-router-dom";
// import "@testing-library/jest-dom";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";

// function handleSubmit(callback, message) {
//   if (message !== "Logged in successfully") {
//     callback(message);
//   }
// }

// jest.mock("axios");
// describe("Login Page", () => {
//   beforeEach(() => {
//     localStorage.clear();
//   });
//   beforeAll(() => {
//     Object.defineProperty(window, 'matchMedia', {
//       writable: true,
//       value: jest.fn().mockImplementation((query) => ({
//         matches: false,
//         media: query,
//         onchange: null,
//         addListener: jest.fn(), // Deprecated
//         removeListener: jest.fn(), // Deprecated
//         addEventListener: jest.fn(),
//         removeEventListener: jest.fn(),
//         dispatchEvent: jest.fn(),
//       })),
//     });
//   });

//   test("renders loginPage", () => {
//     render(
//       <Router>
//         <Login />
//       </Router>,
//     );
//     expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
//     expect(screen.getByRole("button")).not.toBeDisabled();
//     //   expect(await screen.findByText('toast')).toBeInTheDocument('Logged in successfully')
//   });

//   jest.mock("react-hot-toast", () => ({
//     success: jest.fn(),
//     error: jest.fn(),
//   }));

//   // test("handles form submission", async () => {
//   //   const handler = jest.fn();
//   //   handleSubmit(success, "Logged in successfully");

//   //   axios.post.mockResolvedValue({
//   //     data: {
//   //       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ",
//   //       role: "reader",
//   //     },
//   //   });

//   //   render(
//   //     <Router>
//   //       <Login />
//   //     </Router>,
//   //   );
//   //   jest.mock("react-hot-toast", () => ({
//   //     success: jest.fn(),
//   //     error: jest.fn(),
//   //   }));

//   //   fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
//   //     target: { value: "test@example.com" },
//   //   });

//   //   fireEvent.click(screen.getByRole("button", { name: "Login" }));

//   //   await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
//   //   expect(toast.success).toHaveBeenCalledWith(handleSubmit());
//   //   expect(localStorage.getItem("token")).toBe("fake-token");
//   //   expect(localStorage.getItem("role")).toBe("reader");
//   // });

//   test("redirects based on user role", async () => {
//     axios.post.mockResolvedValue({
//       data: {
//         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ",
//         role: "reader",
//       },
//     });

//     render(
//       <Router>
//         <Login />
//       </Router>,
//     );

//     fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
//       target: { value: "r2@example.com" },
//     });

//     fireEvent.click(screen.getByRole("button", { name: "Login" }));

//     await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
//     expect(localStorage.getItem("role")).toBe("reader");
//   });

//   // test('handles login failure', async () => {
//   //     axios.post.mockRejectedValue({
//   //         response: {
//   //             data: {
//   //                 Error: 'Invalid credentials'
//   //             }
//   //         }
//   //     });

//   //     render(
//   //         <Router>
//   //             <Login />
//   //         </Router>
//   //     );

//   //     fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
//   //         target: { value: 'test@example.com' }
//   //     });

//   //     fireEvent.click(screen.getByRole("button", { name: "Login" }));

//   //     await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
//   //     expect(toast.error).toHaveBeenCalledWith(handleSubmit());
//   //     expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
//   // });
// });







// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// // import '@testing-library/jest-dom/extend-expect';
// import axios from 'axios';
// import { MemoryRouter as Router } from "react-router-dom";
// import "@testing-library/jest-dom"
// import Login from "../Pages/LoginPage";
// import toast from 'react-hot-toast';

// jest.mock('axios');
// jest.mock('react-hot-toast', () => ({
//     success: jest.fn(),
//     error: jest.fn()
// }));
// // test("renders loginPage", () => {
// //   render(
// //     <Router>
// //       <Login />
// //     </Router>
// //   );
// //   expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
// //   expect(screen.getByRole('button')).not.toBeDisabled()
// // //   expect(await screen.findByText('toast')).toBeInTheDocument('Logged in successfully')
// // });
// describe('Login Page', () => {
//     beforeEach(() => {
//         localStorage.clear();
//     });

//     test('renders Login component', () => {
//         render(
//             <Router>
//                 <Login />
//             </Router>
//         );
//         expect(screen.getByText('Login')).toBeInTheDocument();
//     });

//     // test('handles form submission', async () => {
//     //     axios.post.mockResolvedValue({
//     //         data: {
//     //             token: 'fake-token',
//     //             role: 'reader'
//     //         }
//     //     });

//     //     render(
//     //         <Router>
//     //             <Login />
//     //         </Router>
//     //     );

//     //     fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
//     //         target: { value: 'test@example.com' }
//     //     });

//     //     fireEvent.click(screen.getByText('Login'));

//     //     await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
//     //     expect(toast.success).toHaveBeenCalledWith('Logged in successfully');
//     //     expect(localStorage.getItem('token')).toBe('fake-token');
//     //     expect(localStorage.getItem('role')).toBe('reader');
//     // });

//     // test('handles login failure', async () => {
//     //     axios.post.mockRejectedValue({
//     //         response: {
//     //             data: {
//     //                 Error: 'Invalid credentials'
//     //             }
//     //         }
//     //     });

//     //     render(
//     //         <Router>
//     //             <Login />
//     //         </Router>
//     //     );

//     //     fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
//     //         target: { value: 'test@example.com' }
//     //     });

//     //     fireEvent.click(screen.getByText('Login'));

//     //     await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
//     //     expect(toast.error).toHaveBeenCalledWith('Login failed');
//     //     expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
//     // });

//     // test('redirects based on user role', async () => {
//     //     axios.post.mockResolvedValue({
//     //         data: {
//     //             token: 'fake-token',
//     //             role: 'admin'
//     //         }
//     //     });

//     //     render(
//     //         <Router>
//     //             <Login />
//     //         </Router>
//     //     );

//     //     fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
//     //         target: { value: 'admin@example.com' }
//     //     });

//     //     fireEvent.click(screen.getByText('Login'));

//     //     await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
//     //     expect(localStorage.getItem('role')).toBe('admin');
//     // });
// });

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../Pages/LoginPage';



jest.mock('axios');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

describe('Login Page', () => {
    test('renders login form', () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('handles form submission and redirects based on role', async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

        axios.post.mockResolvedValue({
            data: {
                token: 'fake-token',
                role: 'admin',
            },
        });

        render(
            <Router>
                <Login />
            </Router>
        );

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard'));
    });

    test('handles login error', async () => {
        axios.post.mockRejectedValue({
            response: {
                data: {
                    Error: 'Invalid credentials',
                },
            },
        });

        render(
            <Router>
                <Login />
            </Router>
        );

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials'));
    });

    test('displays loading state during form submission', async () => {
        axios.post.mockResolvedValue({
            data: {
                token: 'fake-token',
                role: 'admin',
            },
        });

        render(
            <Router>
                <Login />
            </Router>
        );

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(screen.getByRole('button', { name: /logging in.../i })).toBeDisabled();

        await waitFor(() => expect(screen.getByRole('button', { name: /login/i })).not.toBeDisabled());
    });
});