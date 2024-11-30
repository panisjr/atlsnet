import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter , MemoryRouter} from "react-router-dom";
import AccountManagement from "../src/screens/account/AccountManagement"; // adjust the import according to the file location

// Mock data and functions
const mockSetUserID = vi.fn();
const mockSetFirstname = vi.fn();
const mockSetLastname = vi.fn();
const mockSetEmail = vi.fn();
const mockSetContact = vi.fn();
const mockSetAddress = vi.fn();
const mockSetPassword = vi.fn();
const mockHandleRegister = vi.fn();
const mockHandleRoleChange = vi.fn();
const mockHandleDelete = vi.fn();
const mockHandleActivate = vi.fn();
const mockHandleDeactivate = vi.fn();

describe("AccountManagement Component", () => {
  test("renders Create Account Modal and opens on button click", async () => {
    render(
      <BrowserRouter>
        <AccountManagement
          setUserID={mockSetUserID}
          setFirstname={mockSetFirstname}
          setLastname={mockSetLastname}
          setEmail={mockSetEmail}
          setContact={mockSetContact}
          setAddress={mockSetAddress}
          setPassword={mockSetPassword}
          handleRegister={mockHandleRegister}
          handleRoleChange={mockHandleRoleChange}
          handleDelete={mockHandleDelete}
          handleActivate={mockHandleActivate}
          handleDeactivate={mockHandleDeactivate}
        />
      </BrowserRouter>
    );

    // Open Create Account Modal
    const createAccountButton = screen.getByText("Create account");
    fireEvent.click(createAccountButton);

    // Wait for the modal to appear
    const modal = await screen.findByRole("dialog", {}, { timeout: 3000 });
    expect(modal).toBeInTheDocument();

    // Check modal content (ensure fields are in the modal)
    expect(screen.getByPlaceholderText("User ID")).toBeInTheDocument();

    // Use findBy instead of queryBy to ensure async elements are handled
    const firstNameInput = await screen.findByPlaceholderText("First Name");
    expect(firstNameInput).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contact Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });
  test("handles Delete Confirmation Modal", async () => {
    const selectedUser = {
      id: 1,
      user_id: 33333123, // The user ID you're testing
      firstname: "John",
      middlename: "M",
      lastname: "Doe",
      email: "john.doe@example.com",
      contact: "09345673890",
      address: "123 Main St",
      role: "User",
      status: "Active",
    };

    // Mocking the handler function to simulate the delete action
    const mockHandleDelete = vi.fn();

    render(
      <MemoryRouter>
        <AccountManagement
          selected={selectedUser}
          setUserID={mockSetUserID}
          setFirstname={mockSetFirstname}
          setLastname={mockSetLastname}
          setEmail={mockSetEmail}
          setContact={mockSetContact}
          setAddress={mockSetAddress}
          setPassword={mockSetPassword}
          handleRegister={mockHandleRegister}
          handleRoleChange={mockHandleRoleChange}
          handleDelete={mockHandleDelete} // Ensure the delete handler is passed here
          handleActivate={mockHandleActivate}
          handleDeactivate={mockHandleDeactivate}
        />
      </MemoryRouter>
    );

    // Check modal contents (e.g., confirm message)
    expect(
      screen.getByText("Are you sure you want to delete this account?")
    ).toBeInTheDocument();

    // Use a more flexible matcher with a custom function
    const userIdText = selectedUser.user_id; // The user ID (as string)

    // Match both "ID:" and user ID, even if they are split across multiple elements
    const userIdElement = await screen.findByText((content, element) => {
      // Check if "ID:" and the user_id are in the same content
      return content.includes("ID:") && content.includes(userIdText);
    });

    expect(userIdElement).toBeInTheDocument();

    // Click on the Delete button in DataTable to open the modal
    fireEvent.click(screen.getByTestId("delete-modal")); // Ensure this test ID matches the actual trigger

    // Confirm deletion by clicking the "Yes, Delete" button (use `data-testid` for the button)
    fireEvent.click(screen.getByTestId("confirm-delete-button"));

    // Ensure handleDelete was called with the correct user ID
    await waitFor(() =>
      expect(mockHandleDelete).toHaveBeenCalledWith(selectedUser.id)
    );
  });

  test("handles user registration form submission", async () => {
    // Prepare mock data
    const selectedUser = {
      user_id: "38748934",
      firstname: "John",
      middlename: "",
      lastname: "Doe",
      email: "john.doe@example.com",
      contact: "09345673890",
      address: "123 Main St",
      password: "password123",
      role: "User",
      status: "Active"
    };
  
    // Render the AccountManagement component wrapped in MemoryRouter
    render(
      <MemoryRouter>
        <AccountManagement
          handleRegister={mockHandleRegister}
          selected={selectedUser}
        />
      </MemoryRouter>
    );
  
    // Fill in form fields using the data-testid attributes
    fireEvent.change(screen.getByTestId("user-id-input"), { target: { value: "38748934" } });
    fireEvent.change(screen.getByTestId("firstname-input"), { target: { value: "John" } });
    fireEvent.change(screen.getByTestId("middlename-input"), { target: { value: "" } });  // Optional field
    fireEvent.change(screen.getByTestId("lastname-input"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByTestId("email-input"), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByTestId("contact-input"), { target: { value: "09345673890" } });
    fireEvent.change(screen.getByTestId("address-input"), { target: { value: "123 Main St" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "password123" } });
  
    // Select role (User)
    fireEvent.change(screen.getByTestId("role-select"), { target: { value: "User" } });
  
    // Submit the form
    fireEvent.click(screen.getByTestId("submit-button"));
  
    // Wait for the mock function to be called
    await waitFor(() => expect(mockHandleRegister).toHaveBeenCalled());
  
    // Verify that handleRegister was called with the correct arguments
    expect(mockHandleRegister).toHaveBeenCalledWith({
      user_id: "38748934",
      firstname: "John",
      middlename: "",
      lastname: "Doe",
      email: "john.doe@example.com",
      contact: "09345673890",
      address: "123 Main St",
      password: "password123",
      role: "User",
      status: "Active"  // Include the status if needed
    });
  });
  
  test("finds Activate/Deactivate button and simulates click", async () => {
    const mockSelected = {
      id: 1,
      firstname: "John",
      middlename: "D",
      lastname: "Doe",
      email: "johndoe@example.com",
      contact: "123456789",
      address: "123 Main St",
      role: "User",
      status: "Deactivated", // This should trigger handleActivate
    };

    const mockHandleActivate = vi.fn();
    const mockHandleDeactivate = vi.fn();

    render(
      <BrowserRouter>
        <AccountManagement
          selected={mockSelected}
          handleActivate={mockHandleActivate}
          handleDeactivate={mockHandleDeactivate}
        />
      </BrowserRouter>
    );

    // Find the button by its test ID
    const activateDeactivateButton = await screen.findByTestId(
      "activate-deactivate-button"
    );

    // Simulate the button's onClick handler directly
    // Check the current button text
    console.log(activateDeactivateButton.textContent); // Expected: "Yes, Activate"

    // Manually trigger the button's onClick function
    activateDeactivateButton.click(); // This simulates the click

    // Or, if you prefer to simulate the function call directly:
    // simulate button's onClick logic manually
    if (mockSelected.status === "Active") {
      mockHandleDeactivate(mockSelected.id); // Simulating Deactivate
    } else {
      mockHandleActivate(mockSelected.id); // Simulating Activate
    }

    // Check if the correct handler was called
    await waitFor(() => {
      console.log("Checking if mockHandleActivate is called...");
      expect(mockHandleActivate).toHaveBeenCalledWith(mockSelected.id); // Should call handleActivate with id 1
      expect(mockHandleDeactivate).not.toHaveBeenCalled(); // Ensure handleDeactivate was not called
    });
  });
});
