import { render, screen } from "@testing-library/react";
import HomePage from "../Pages/Homepage";
import React from "react";
import "@testing-library/jest-dom"; //

test("renders homepage", () => {
    render(<HomePage />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument(); 
});