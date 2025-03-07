import { render, screen } from "@testing-library/react";
import ReaderDashboard from "../Pages/ReaderDashboard";
import React from "react";
import "@testing-library/jest-dom"; 

test("renders homepage", () => {
    render(<ReaderDashboard />);
    // expect(screen.getByText(/Reader Dashboard/i)).toBeInTheDocument(); 
    // expect(screen.getByText(/Recently added books/i)).toBeInTheDocument(); 
    // expect(screen.getByRole("available")).toBeInTheDocument();
    // expect(screen.getByRole("search")).toBeInTheDocument();
});