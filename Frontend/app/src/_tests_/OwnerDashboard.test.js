import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import OwnerDashboard from "../Pages/OwnerDashboard";
import React from "react";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("axios");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn()
}));
jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    },
    Toaster: () => <div data-testid="toast-container" />
}));

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxAZ21haWwuY29tIiwiaWQiOjksInJvbGUiOiJvd25lciJ9.eRndaP1GVyZ4rWEU8TO3-RvDk6IKHTp7SBEWBEFWEkeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();

Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true
});

// Mock fetch
global.fetch = jest.fn();

describe("OwnerDashboard Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxAZ21haWwuY29tIiwiaWQiOjksInJvbGUiOiJvd25lciJ9.eRndaP1GVyZ4rWEU8TO3-RvDk6IKHTp7SBEWBEFWEkeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY");
    });

    afterEach(() => {
        global.fetch.mockClear();
    });

    test("renders owner dashboard with correct titles", async () => {
        // Mock API responses
        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/library/getlib") {
                return Promise.resolve({ data: { library: { id: 7, name: "oo" } } });
            }
            if (url === "http://localhost:8000/api/library/getAdmins") {
                return Promise.resolve({ data: { admins: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        render(
            <MemoryRouter>
                <OwnerDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText("Welcome Owner")).toBeInTheDocument();
        expect(screen.getByText("Your Libraries")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Library Admins")).toBeInTheDocument();
        });
    });

    test("fetches and displays library data", async () => {
        // Mock API responses for library data
        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/library/getlib") {
                return Promise.resolve({
                    data: {
                        library: {
                            id: 1,
                            name: "Test Library"
                        }
                    }
                });
            }
            if (url === "http://localhost:8000/api/library/getAdmins") {
                return Promise.resolve({ data: { admins: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        render(
            <MemoryRouter>
                <OwnerDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Name: Test Library")).toBeInTheDocument();
            expect(screen.getByText("ID: 1")).toBeInTheDocument();
            expect(screen.getByText("Has 0 admin(s)")).toBeInTheDocument();
        });
    });

    test("fetches and displays admin data", async () => {
        // Mock API responses for admin data
        const mockAdmins = [
            {
                id: "admin1",
                name: "Admin User",
                email: "admin@example.com",
                contact_no: "1234567890"
            }
        ];

        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/library/getlib") {
                return Promise.resolve({
                    data: {
                        library: {
                            id: 7,
                            name: "oo"
                        }
                    }
                });
            }
            if (url === "http://localhost:8000/api/library/getAdmins") {
                return Promise.resolve({ data: { admins: mockAdmins } });
            }
            return Promise.reject(new Error("Not found"));
        });

        render(
            <MemoryRouter>
                <OwnerDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Name: Admin User")).toBeInTheDocument();
            expect(screen.getByText("Email: admin@example.com")).toBeInTheDocument();
            expect(screen.getByText("Contact: 1234567890")).toBeInTheDocument();
            expect(screen.getByText("Has 1 admin(s)")).toBeInTheDocument();
        });
    });

    // test("shows library creation modal when Create Library button is clicked", async () => {
    //     // Mock API responses for no library
    //     axios.get.mockImplementation((url) => {
    //         if (url === "http://localhost:8000/api/library/getlib") {
    //             return Promise.resolve({ data: { library: null } });
    //         }
    //         if (url === "http://localhost:8000/api/library/getAdmins") {
    //             return Promise.resolve({ data: { admins: [] } });
    //         }
    //         return Promise.reject(new Error("Not found"));
    //     });

    //     render(
    //         <MemoryRouter>
    //             <OwnerDashboard />
    //         </MemoryRouter>
    //     );

    //     // Wait for the page to load
    //     await waitFor(() => {
    //         expect(screen.getByText("Your Libraries")).toBeInTheDocument();
    //     });

    //     const createLibraryButton = screen.getByText("Create Library");
    //     fireEvent.click(createLibraryButton);

    //     expect(screen.getByText("Create Library", { selector: "h2" })).toBeInTheDocument();
    //     expect(screen.getByLabelText("Library Name:")).toBeInTheDocument();
    //     expect(screen.getByText("Submit")).toBeInTheDocument();
    //     expect(screen.getByText("Close")).toBeInTheDocument();
    // });

    // test("shows admin creation modal when Create Admin button is clicked", async () => {
    //     // Mock API responses
    //     axios.get.mockImplementation((url) => {
    //         if (url === "http://localhost:8000/api/library/getlib") {
    //             return Promise.resolve({
    //                 data: {
    //                     library: {
    //                         id: 1,
    //                         name: "Test Library"
    //                     }
    //                 }
    //             });
    //         }
    //         if (url === "http://localhost:8000/api/library/getAdmins") {
    //             return Promise.resolve({ data: { admins: [] } });
    //         }
    //         return Promise.reject(new Error("Not found"));
    //     });

    //     render(
    //         <MemoryRouter>
    //             <OwnerDashboard />
    //         </MemoryRouter>
    //     );

    //     await waitFor(() => {
    //         expect(screen.getByText("Create Admin")).toBeInTheDocument();
    //     });

    //     fireEvent.click(screen.getByText("Create Admin"));

    //     expect(screen.getByText("Create Admin", { selector: "h2" })).toBeInTheDocument();
    //     // expect(screen.getByLabelText("Name:")).toBeInTheDocument();
    //     // expect(screen.getByLabelText("Email:")).toBeInTheDocument();
    //     expect(screen.getByLabelText("Contact Number:")).toBeInTheDocument();
    // });

    // test("creates a library successfully", async () => {
    //     // Mock API responses
    //     axios.get.mockImplementation((url) => {
    //         if (url === "http://localhost:8000/api/library/getlib") {
    //             return Promise.resolve({ data: { library: null } });
    //         }
    //         if (url === "http://localhost:8000/api/library/getAdmins") {
    //             return Promise.resolve({ data: { admins: [] } });
    //         }
    //         return Promise.reject(new Error("Not found"));
    //     });

    //     // Mock fetch response for library creation
    //     global.fetch.mockImplementationOnce(() =>
    //         Promise.resolve({
    //             ok: true,
    //             json: () => Promise.resolve({ message: "Library created successfully" })
    //         })
    //     );

    //     render(
    //         <MemoryRouter>
    //             <OwnerDashboard />
    //         </MemoryRouter>
    //     );

    //     // Wait for the page to load
    //     await waitFor(() => {
    //         expect(screen.getByText("Your Libraries")).toBeInTheDocument();
    //     });

    //     const createLibraryButton = screen.getByText("Create Library");
    //     fireEvent.click(createLibraryButton);

    //     // Fill out the library form
    //     const libraryNameInput = screen.getByLabelText("Library Name:");
    //     fireEvent.change(libraryNameInput, { target: { value: "New Test Library" } });

    //     // Submit the form
    //     fireEvent.click(screen.getByText("Submit"));

    //     await waitFor(() => {
    //         expect(global.fetch).toHaveBeenCalledWith(
    //             "http://localhost:8000/api/library/create",
    //             expect.objectContaining({
    //                 method: "POST",
    //                 headers: expect.objectContaining({
    //                     Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxAZ21haWwuY29tIiwiaWQiOjksInJvbGUiOiJvd25lciJ9.eRndaP1GVyZ4rWEU8TO3-RvDk6IKHTp7SBEWBEFWEkeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"
    //                 }),
    //                 body: JSON.stringify({ name: "New Test Library" })
    //             })
    //         );
    //         expect(toast.success).toHaveBeenCalledWith("Library created successfully!");
    //     });
    // });

    // test("creates an admin successfully", async () => {
    //     // Mock API responses
    //     axios.get.mockImplementation((url) => {
    //         if (url === "http://localhost:8000/api/library/getlib") {
    //             return Promise.resolve({
    //                 data: {
    //                     library: {
    //                         id: 1,
    //                         name: "Test Library"
    //                     }
    //                 }
    //             });
    //         }
    //         if (url === "http://localhost:8000/api/library/getAdmins") {
    //             return Promise.resolve({ data: { admins: [] } });
    //         }
    //         return Promise.reject(new Error("Not found"));
    //     });

    //     // Mock fetch response for admin creation
    //     global.fetch.mockImplementationOnce(() =>
    //         Promise.resolve({
    //             ok: true,
    //             json: () => Promise.resolve({ message: "Admin created successfully" })
    //         })
    //     );

    //     render(
    //         <MemoryRouter>
    //             <OwnerDashboard />
    //         </MemoryRouter>
    //     );

    //     await waitFor(() => {
    //         expect(screen.getByText("Create Admin")).toBeInTheDocument();
    //     });

    //     fireEvent.click(screen.getByText("Create Admin"));

    //     // Fill out the admin form
    //     const nameInput = screen.getByLabelText("Name:");
    //     const emailInput = screen.getByLabelText("Email:");
    //     const contactInput = screen.getByLabelText("Contact Number:");

    //     fireEvent.change(nameInput, { target: { value: "New Admin" } });
    //     fireEvent.change(emailInput, { target: { value: "newadmin@example.com" } });
    //     fireEvent.change(contactInput, { target: { value: "9876543210" } });

    //     // Submit the form
    //     fireEvent.click(screen.getByText("Submit"));

    //     await waitFor(() => {
    //         expect(global.fetch).toHaveBeenCalledWith(
    //             "http://localhost:8000/api/library/create-admin",
    //             expect.objectContaining({
    //                 method: "POST",
    //                 headers: expect.objectContaining({
    //                     Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxAZ21haWwuY29tIiwiaWQiOjksInJvbGUiOiJvd25lciJ9.eRndaP1GVyZ4rWEU8TO3-RvDk6IKHTp7SBEWBEFWEkeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"
    //                 }),
    //                 body: JSON.stringify({
    //                     name: "New Admin",
    //                     email: "newadmin@example.com",
    //                     contact_no: "9876543210"
    //                 })
    //             })
    //         );
    //         expect(toast.success).toHaveBeenCalledWith("Admin created Successfully!");
    //     });
    // });

    // test("handles library creation error", async () => {
    //     // Mock API responses
    //     axios.get.mockImplementation((url) => {
    //         if (url === "http://localhost:8000/api/library/getlib") {
    //             return Promise.resolve({ data: { library: null } });
    //         }
    //         if (url === "http://localhost:8000/api/library/getAdmins") {
    //             return Promise.resolve({ data: { admins: [] } });
    //         }
    //         return Promise.reject(new Error("Not found"));
    //     });

    //     // Mock fetch error response
    //     global.fetch.mockImplementationOnce(() =>
    //         Promise.resolve({
    //             ok: false,
    //             json: () => Promise.resolve({ Error: "Library already exists" })
    //         })
    //     );

    //     render(
    //         <MemoryRouter>
    //             <OwnerDashboard />
    //         </MemoryRouter>
    //     );

    //     // Wait for the page to load
    //     await waitFor(() => {
    //         expect(screen.getByText("Your Libraries")).toBeInTheDocument();
    //     });

    //     const createLibraryButton = screen.getByText("Create Library");
    //     fireEvent.click(createLibraryButton);

    //     // Fill out the library form
    //     const libraryNameInput = screen.getByLabelText("Library Name:");
    //     fireEvent.change(libraryNameInput, { target: { value: "Existing Library" } });

    //     // Submit the form
    //     fireEvent.click(screen.getByText("Submit"));

    //     await waitFor(() => {
    //         expect(toast.error).toHaveBeenCalledWith("Library already exists");
    //         expect(screen.getByText("Library already exists")).toBeInTheDocument();
    //     });
    // });
});