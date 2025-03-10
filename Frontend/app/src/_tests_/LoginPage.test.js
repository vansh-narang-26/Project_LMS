import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Login from "../Pages/LoginPage";
import React from "react";
import "@testing-library/jest-dom";


jest.mock("axios");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));
jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    },
    Toaster: () => <div data-testid="toast-container" />
}));

// Mock local storage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        })
    };
})();

Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true
});

//Mock function for navigation
const mockNavigate = jest.fn();

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.clear();
    });

    test("renders login form correctly", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Check for main elements
        expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
        // expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
    });

    test("redirects to appropriate dashboard if user is already logged in (admin)", () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === "token") return "fake-token";
            if (key === "role") return "admin";
            return null;
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith("/admin-dashboard");
    });

    test("redirects to appropriate dashboard if user is already logged in (owner)", () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === "token") return "fake-token";
            if (key === "role") return "owner";
            return null;
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith("/owner-dashboard");
    });

    test("redirects to reader dashboard for default role", () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === "token") return "fake-token";
            if (key === "role") return "reader";
            return null;
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith("/reader-dashboard");
    });

    test("allows user to input email", async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, "test@example.com");
        expect(emailInput.value).toBe("test@example.com");
    });

    test("shows loading state when form is submitted", async () => {
        // Mock axios to delay response
        axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, "test@example.com");

        const submitButton = screen.getByRole("button", { name: /login/i });
        fireEvent.click(submitButton);

        expect(screen.getByRole("button", { name: /logging in\.\.\./i })).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeDisabled();
    });

    test("handles successful login", async () => {
        // Mock successful API response
        const mockResponse = {
            data: {
                token: "fake-token-123",
                role: "admin"
            }
        };
        axios.post.mockResolvedValueOnce(mockResponse);

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, "admin@example.com");

        const submitButton = screen.getByRole("button", { name: /login/i });
        fireEvent.click(submitButton);

        // Wait for the API call to resolve
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "http://localhost:8000/api/users/login",
                { email: "admin@example.com" },
                { headers: { "Content-Type": "application/json" } }
            );
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("token", "fake-token-123");
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("role", "admin");
        });
    });

    test("displays error message on failed login", async () => {
        // Mock API error response
        const errorMessage = "Invalid email address";
        axios.post.mockRejectedValueOnce({
            response: {
                data: {
                    Error: errorMessage
                }
            }
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, "invalid@example.com");

        const submitButton = screen.getByRole("button", { name: /login/i });
        fireEvent.click(submitButton);

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(errorMessage);
        });
    });

    test("handles server connection error", async () => {
        // Mock network error
        axios.post.mockRejectedValueOnce(new Error("Network Error"));

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, "test@example.com");

        const submitButton = screen.getByRole("button", { name: /login/i });
        fireEvent.click(submitButton);

        // Wait for the generic error message to appear
        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Unable to connect to the server. Please try again later."
            );
        });
    });

    test("redirects to register page when register link is clicked", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const registerLink = screen.getByRole("link", { name: /register/i });
        expect(registerLink).toHaveAttribute("href", "/register");
    });
});