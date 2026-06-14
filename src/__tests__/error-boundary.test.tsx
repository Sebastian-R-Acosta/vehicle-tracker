import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RootError from "@/app/error";

const mockReset = jest.fn();

beforeEach(() => {
  mockReset.mockClear();
});

describe("RootError boundary", () => {
  it("renders default error message when no error message provided", () => {
    const error = new Error();
    render(<RootError error={error} reset={mockReset} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
  });

  it("renders the error message", () => {
    const error = new Error("Database connection failed");
    render(<RootError error={error} reset={mockReset} />);

    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("renders Try again and Go to Home buttons", () => {
    const error = new Error("test error");
    render(<RootError error={error} reset={mockReset} />);

    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("Go to Home")).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const error = new Error("test error");
    render(<RootError error={error} reset={mockReset} />);

    await user.click(screen.getByText("Try again"));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("has aria-hidden icon", () => {
    const error = new Error("test error");
    const { container } = render(<RootError error={error} reset={mockReset} />);

    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it("has link to home page", () => {
    const error = new Error("test error");
    render(<RootError error={error} reset={mockReset} />);

    const link = screen.getByText("Go to Home").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });
});
