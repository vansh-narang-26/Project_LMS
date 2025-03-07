import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom"; 
import OwnerDashboard from "../Pages/OwnerDashboard";

test("renders homepage", () => {
    render(<OwnerDashboard />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument(); 
    expect(screen.getByText(/Library Admins/i)).toBeInTheDocument()
});