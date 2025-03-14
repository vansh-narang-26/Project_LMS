import { render, screen, fireEvent, waitFor,act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import axios from "axios";
import RegisterPage from "../Pages/RegisterPage";
import React from "react";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";


jest.mock("axios");
// beforeEach(() => {
//     jest.clearAllMocks(); 
// });
jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: jest.fn((message) => message),
    success: jest.fn(),
    error: jest.fn(),
    Toaster: () => <div data-testid="toast-container" />
}));


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe("RegisterPage Component", () => {
    const mockLibraries = [
        { id: 1, name: "d" },
        { id: 2, name: "dd" }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockResolvedValue({
            data: { libraries: mockLibraries }
        });
    });

    test("renders registration form with all required fields", async () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );

        expect(screen.getByText("Create Your Account")).toBeInTheDocument();
        expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
        expect(screen.getByLabelText("Contact Number")).toBeInTheDocument();
        expect(screen.getByLabelText("Select Role")).toBeInTheDocument();

        expect(screen.getByText("Already have an account?")).toBeInTheDocument();
        expect(screen.getByText("Sign in")).toBeInTheDocument();
        expect(screen.getByText("Sign in").closest('a')).toHaveAttribute('href', '/login');
    });

    test("fetches libraries on component mount", async () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );
        expect(axios.get).toHaveBeenCalledWith("http://localhost:8000/api/getLib");
    });

    test("shows library selection only when reader role is selected", async () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );

        const roleSelect = screen.getByLabelText("Select Role");
        await userEvent.selectOptions(roleSelect, "reader");

        await expect(screen.findByLabelText("Select Library")).resolves.toBeInTheDocument();



        await waitFor(() => {
            const libraryOptions = screen.getAllByRole("option");

            expect(libraryOptions.length).toBe(6);
            expect(screen.getByText("d")).toBeInTheDocument();
            expect(screen.getByText("dd")).toBeInTheDocument();
        });
        await userEvent.selectOptions(roleSelect, "owner");
        expect(screen.queryByLabelText("Select Library")).not.toBeInTheDocument();
    });

    // test("automatically sets lib_id to 0 when selecting role of owner", async () => {

    //     axios.post.mockRejectedValueOnce({
    //         response: {
    //             data: {
    //                 Error: "Couldnt Register"
    //             }
    //         }
    //     });

    //     act(()=> render(
    //         <MemoryRouter>
    //             <RegisterPage />
    //         </MemoryRouter>
    //     ));

    
    //     // const roleSelect = screen.getByLabelText("Select Role");
    //     // await userEvent.selectOptions(roleSelect, "Reader");

    //     // const librarySelect = screen.getByLabelText("Select Library");
    //     // await userEvent.selectOptions(librarySelect, "1");
    //     await userEvent.selectOptions(screen.getByLabelText("Select Role"), "Owner");


    //     const submitButton = screen.getByRole("button", { name: "Register" });
    //  //   console.log(submitButton)
    //     fireEvent.click(submitButton);

    //     await waitFor(() => {
    //         expect(axios.post).toHaveBeenCalledWith(
    //             "http://localhost:8000/api/users/register",
    //             expect.objectContaining({
    //                 contact_no: "3233",
    //                 email: "vas@gmail.com",
    //                 id: 40,
    //                 lib_id: 0,
    //                 name: "vasn",
    //                 role: "owner",
    //             })
    //         );
    //         expect(toast.success).toHaveBeenCalledWith("Registration successful");
    //     });
    // });

    // test("converts lib_id to integer when selecting a library", async () => {
    //     render(
    //         <MemoryRouter>
    //             <RegisterPage />
    //         </MemoryRouter>
    //     );

    //     // Fill out the form
    //     await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    //     await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
    //     await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");

    //     // Select 'reader' role
    //     const roleSelect = screen.getByLabelText("Select Role");
    //     await userEvent.selectOptions(roleSelect, "reader");

    //     // Select a library
    //     const librarySelect = screen.getByLabelText("Select Library");
    //     await userEvent.selectOptions(librarySelect, "2");

    //     // Submit the form
    //     const submitButton = screen.getByRole("button", { name: "Register" });
    //     fireEvent.click(submitButton);

    //     await waitFor(() => {
    //         expect(axios.post).toHaveBeenCalledWith(
    //             "http://localhost:8000/api/users/register",
    //             expect.objectContaining({
    //                 role: "reader",
    //                 lib_id: 2 
    //             })
    //         );
    //     });
    // });

    // test("submits form with valid data and handles success", async () => {
    //     axios.post.mockResolvedValueOnce({ data: { message: "Registration successful" } });

    //     render(
    //         <MemoryRouter>
    //             <RegisterPage />
    //         </MemoryRouter>
    //     );
    //     await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    //     await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
    //     await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");

    //     // Select 'reader' role
    //     const roleSelect = screen.getByLabelText("Select Role");
    //     await userEvent.selectOptions(roleSelect, "Reader");

    //     // Select a library
    //     await waitFor(() => {
    //         expect(screen.getByLabelText("Select Library")).toBeInTheDocument();
    //     });
    //     const librarySelect = screen.getByLabelText("Select Library");
    //     await userEvent.selectOptions(librarySelect, "1");

    //     // Submit the form
    //     const submitButton = screen.getByRole("button", { name: "Register" });
    //     fireEvent.click(submitButton);

    //     // Verify form submission
    //     await waitFor(() => {
    //         expect(axios.post).toHaveBeenCalledWith(
    //             "http://localhost:8000/api/users/register",
    //             {
    //                 name: "Test User",
    //                 email: "test@example.com",
    //                 contact_no: "1234567890",
    //                 role: "reader",
    //                 lib_id: 1
    //             }
    //         );
    //     });

    //     // Verify success message and toast
    //     await waitFor(() => {
    //         expect(toast.success).toHaveBeenCalledWith("Registration Successful");
    //         expect(screen.getByText("Registration Successful! Redirecting...")).toBeInTheDocument();
    //     });

    //     // Verify navigation after delay
    //     await waitFor(() => {
    //         expect(mockNavigate).toHaveBeenCalledWith("/login");
    //     }, { timeout: 3000 });
    // });

    // test("handles registration error and displays error message", async () => {
    //     // Mock error response
    //     const errorMessage = "Email already exists";
    //     axios.post.mockRejectedValueOnce({
    //         response: { data: { Error: errorMessage } }
    //     });

    //     render(
    //         <MemoryRouter>
    //             <RegisterPage />
    //         </MemoryRouter>
    //     );

    //     // Fill out the form
    //     await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    //     await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
    //     await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");

    //     // Select 'owner' role (no library needed)
    //     const roleSelect = screen.getByLabelText("Select Role");
    //     await userEvent.selectOptions(roleSelect, "owner");

    //     // Submit the form
    //     const submitButton = screen.getByRole("button", { name: "Register" });
    //     fireEvent.click(submitButton);

    //     // Verify error handling
    //     await waitFor(() => {
    //         expect(toast.error).toHaveBeenCalledWith(errorMessage);
    //         expect(screen.getByText(errorMessage)).toBeInTheDocument();
    //     });

    //     // Verify the button is enabled again
    //     expect(submitButton).not.toBeDisabled();
    // });

    // test("handles registration error with no response data", async () => {
    //     // Mock error with no response data
    //     axios.post.mockRejectedValueOnce(new Error("Network error"));

    //     render(
    //         <MemoryRouter>
    //             <RegisterPage />
    //         </MemoryRouter>
    //     );

    //     // Fill out minimal form data
    //     await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    //     await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
    //     await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");
    //     await userEvent.selectOptions(screen.getByLabelText("Select Role"), "owner");

    //     // Submit the form
    //     const submitButton = screen.getByRole("button", { name: "Register" });
    //     fireEvent.click(submitButton);

    //     // Verify fallback error message
    //     await waitFor(() => {
    //         expect(toast.error).toHaveBeenCalledWith("Registration failed");
    //     });
    // });

    // test("changes button text to 'Processing...' while submitting", async () => {
    //     // Mock a delayed response
    //     axios.post.mockImplementationOnce(() => {
    //         return new Promise(resolve => {
    //             setTimeout(() => {
    //                 resolve({ data: { message: "Success" } });
    //             }, 500);
    //         });
    //     });

    //     render(
    //         <MemoryRouter>
    //             <RegisterPage />
    //         </MemoryRouter>
    //     );

    //     // Fill out minimal form data
    //     await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    //     await userEvent.type(screen.getByLabelText("Email Address"), "test@example.com");
    //     await userEvent.type(screen.getByLabelText("Contact Number"), "1234567890");
    //     await userEvent.selectOptions(screen.getByLabelText("Select Role"), "owner");

    //     // Submit the form
    //     const submitButton = screen.getByRole("button", { name: "Register" });
    //     fireEvent.click(submitButton);

    //     // Button should show "Processing..." and be disabled
    //     expect(screen.getByRole("button", { name: "Processing..." })).toBeInTheDocument();
    //     expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();

    //     // After response, button should return to normal
    //     await waitFor(() => {
    //         expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
    //         expect(screen.getByRole("button", { name: "Register" })).not.toBeDisabled();
    //     }, { timeout: 1000 });
    // });

    test("renders Toaster component with correct props", () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId("toast-container")).toBeInTheDocument();
    });

    test("validate that all fields are required", async () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );
        const submitButton = screen.getByRole("button", { name: "Register" });
        fireEvent.click(submitButton);

        expect(axios.post).not.toHaveBeenCalled();
    });
});