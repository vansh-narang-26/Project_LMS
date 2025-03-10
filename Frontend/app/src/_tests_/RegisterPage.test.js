// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { BrowserRouter, MemoryRouter } from "react-router-dom";
// import axios from "axios";
// import RegisterPage from "../Pages/RegisterPage";
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

// // Mock useNavigate
// const mockNavigate = jest.fn();
// jest.mock("react-router-dom", () => ({
//     ...jest.requireActual("react-router-dom"),
//     useNavigate: () => mockNavigate,
//     Link: ({ children, to }) => <a href={to}>{children}</a>
// }));

// describe("RegisterPage Component", () => {
//     const mockLibraries = [
//         { id: 1, name: "Central Library" },
//         { id: 2, name: "City Library" }
//     ];

//     beforeEach(() => {
//         jest.clearAllMocks();
//         // Mock libraries API response
//         axios.get.mockResolvedValue({
//             data: { libraries: mockLibraries }
//         });
//     });

//     test("renders registration form with all required fields", async () => {
//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         expect(screen.getByText("Create Your Account")).toBeInTheDocument();
//         expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
//         expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
//         expect(screen.getByLabelText("Contact Number")).toBeInTheDocument();
//         expect(screen.getByLabelText("Select Role")).toBeInTheDocument();

//         // Check for login link
//         expect(screen.getByText("Already have an account?")).toBeInTheDocument();
//         expect(screen.getByText("Sign in")).toBeInTheDocument();
//         expect(screen.getByText("Sign in").closest('a')).toHaveAttribute('href', '/login');
//     });

//     test("fetches libraries on component mount", async () => {
//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Verify libraries API was called
//         expect(axios.get).toHaveBeenCalledWith("http://localhost:8000/api/getLib");
//     });

//     test("handles API error when fetching libraries", async () => {
//         // Mock API error
//         axios.get.mockRejectedValueOnce(new Error("Network error"));

//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         await waitFor(() => {
//             expect(toast.error).toHaveBeenCalledWith("Could not fetch libraries");
//         });
//     });

//     test("shows library selection only when 'reader' role is selected", async () => {
//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Initially, library selection should not be visible
//         expect(screen.queryByLabelText("Select Library")).not.toBeInTheDocument();

//         // Select 'reader' role
//         const roleSelect = screen.getByLabelText("Select Role");
//         await userEvent.selectOptions(roleSelect, "reader");

//         // Now, library selection should be visible
//         expect(screen.getByLabelText("Select Library")).toBeInTheDocument();

//         // Libraries should be populated
//         await waitFor(() => {
//             const libraryOptions = screen.getAllByRole("option");
//             // +1 for the default "Select a library" option
//             expect(libraryOptions.length).toBe(3);
//             expect(screen.getByText("Central Library")).toBeInTheDocument();
//             expect(screen.getByText("City Library")).toBeInTheDocument();
//         });

//         // Change to 'owner' role
//         await userEvent.selectOptions(roleSelect, "owner");

//         // Library selection should disappear
//         expect(screen.queryByLabelText("Select Library")).not.toBeInTheDocument();
//     });

//     test("automatically sets lib_id to 0 when selecting 'owner' role", async () => {
//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Select 'reader' role first
//         const roleSelect = screen.getByLabelText("Select Role");
//         await userEvent.selectOptions(roleSelect, "reader");

//         // Select a library
//         const librarySelect = screen.getByLabelText("Select Library");
//         await userEvent.selectOptions(librarySelect, "1");

//         // Change to 'owner' role
//         await userEvent.selectOptions(roleSelect, "owner");

//         // Submit the form
//         const submitButton = screen.getByRole("button", { name: "Register" });
//         fireEvent.click(submitButton);

//         // Verify that lib_id was set to 0 in the form data
//         await waitFor(() => {
//             expect(axios.post).toHaveBeenCalledWith(
//                 "http://localhost:8000/api/users/register",
//                 expect.objectContaining({
//                     role: "owner",
//                     lib_id: 0
//                 })
//             );
//         });
//     });

//     test("converts lib_id to integer when selecting a library", async () => {
//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Fill out the form
//         await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
//         await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
//         await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");

//         // Select 'reader' role
//         const roleSelect = screen.getByLabelText("Select Role");
//         await userEvent.selectOptions(roleSelect, "reader");

//         // Select a library
//         const librarySelect = screen.getByLabelText("Select Library");
//         await userEvent.selectOptions(librarySelect, "2");

//         // Submit the form
//         const submitButton = screen.getByRole("button", { name: "Register" });
//         fireEvent.click(submitButton);

//         // Verify that lib_id is an integer (not a string)
//         await waitFor(() => {
//             expect(axios.post).toHaveBeenCalledWith(
//                 "http://localhost:8000/api/users/register",
//                 expect.objectContaining({
//                     role: "reader",
//                     lib_id: 2  // This should be a number, not "2"
//                 })
//             );
//         });
//     });

//     test("submits form with valid data and handles success", async () => {
//         // Mock successful registration response
//         axios.post.mockResolvedValueOnce({ data: { message: "Registration successful" } });

//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Fill out the form
//         await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
//         await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
//         await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");

//         // Select 'reader' role
//         const roleSelect = screen.getByLabelText("Select Role");
//         await userEvent.selectOptions(roleSelect, "reader");

//         // Select a library
//         await waitFor(() => {
//             expect(screen.getByLabelText("Select Library")).toBeInTheDocument();
//         });
//         const librarySelect = screen.getByLabelText("Select Library");
//         await userEvent.selectOptions(librarySelect, "1");

//         // Submit the form
//         const submitButton = screen.getByRole("button", { name: "Register" });
//         fireEvent.click(submitButton);

//         // Verify form submission
//         await waitFor(() => {
//             expect(axios.post).toHaveBeenCalledWith(
//                 "http://localhost:8000/api/users/register",
//                 {
//                     name: "Test User",
//                     email: "test@example.com",
//                     contact_no: "1234567890",
//                     role: "reader",
//                     lib_id: 1
//                 }
//             );
//         });

//         // Verify success message and toast
//         await waitFor(() => {
//             expect(toast.success).toHaveBeenCalledWith("Registration Successful");
//             expect(screen.getByText("Registration Successful! Redirecting...")).toBeInTheDocument();
//         });

//         // Verify navigation after delay
//         await waitFor(() => {
//             expect(mockNavigate).toHaveBeenCalledWith("/login");
//         }, { timeout: 3000 });
//     });

//     test("handles registration error and displays error message", async () => {
//         // Mock error response
//         const errorMessage = "Email already exists";
//         axios.post.mockRejectedValueOnce({
//             response: { data: { Error: errorMessage } }
//         });

//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Fill out the form
//         await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
//         await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
//         await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");

//         // Select 'owner' role (no library needed)
//         const roleSelect = screen.getByLabelText("Select Role");
//         await userEvent.selectOptions(roleSelect, "owner");

//         // Submit the form
//         const submitButton = screen.getByRole("button", { name: "Register" });
//         fireEvent.click(submitButton);

//         // Verify error handling
//         await waitFor(() => {
//             expect(toast.error).toHaveBeenCalledWith(errorMessage);
//             expect(screen.getByText(errorMessage)).toBeInTheDocument();
//         });

//         // Verify the button is enabled again
//         expect(submitButton).not.toBeDisabled();
//     });

//     test("handles registration error with no response data", async () => {
//         // Mock error with no response data
//         axios.post.mockRejectedValueOnce(new Error("Network error"));

//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Fill out minimal form data
//         await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
//         await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
//         await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");
//         await userEvent.selectOptions(screen.getByLabelText("Select Role"), "owner");

//         // Submit the form
//         const submitButton = screen.getByRole("button", { name: "Register" });
//         fireEvent.click(submitButton);

//         // Verify fallback error message
//         await waitFor(() => {
//             expect(toast.error).toHaveBeenCalledWith("Registration failed");
//         });
//     });

//     test("changes button text to 'Processing...' while submitting", async () => {
//         // Mock a delayed response
//         axios.post.mockImplementationOnce(() => {
//             return new Promise(resolve => {
//                 setTimeout(() => {
//                     resolve({ data: { message: "Success" } });
//                 }, 500);
//             });
//         });

//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Fill out minimal form data
//         await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
//         await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
//         await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");
//         await userEvent.selectOptions(screen.getByLabelText("Select Role"), "owner");

//         // Submit the form
//         const submitButton = screen.getByRole("button", { name: "Register" });
//         fireEvent.click(submitButton);

//         // Button should show "Processing..." and be disabled
//         expect(screen.getByRole("button", { name: "Processing..." })).toBeInTheDocument();
//         expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();

//         // After response, button should return to normal
//         await waitFor(() => {
//             expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
//             expect(screen.getByRole("button", { name: "Register" })).not.toBeDisabled();
//         }, { timeout: 1000 });
//     });

//     test("renders Toaster component with correct props", () => {
//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Verify toast container is rendered
//         expect(screen.getByTestId("toast-container")).toBeInTheDocument();
//     });

//     test("validate that all fields are required", async () => {
//         render(
//             <MemoryRouter>
//                 <RegisterPage />
//             </MemoryRouter>
//         );

//         // Try to submit without filling anything
//         const submitButton = screen.getByRole("button", { name: "Register" });
//         fireEvent.click(submitButton);

//         // HTML5 validation should prevent submission, axios.post should not be called
//         expect(axios.post).not.toHaveBeenCalled();
//     });
// });