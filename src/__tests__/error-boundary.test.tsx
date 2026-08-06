import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RootError from "@/app/error";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { es } from "@/lib/i18n/es";

const mockReset = jest.fn();

// RootError reads its copy through useLanguage(), so it has to render inside the
// provider. Assertions use the `es` bundle because that is the default locale.
function renderError(error: Error) {
  return render(
    <LanguageProvider>
      <RootError error={error} reset={mockReset} />
    </LanguageProvider>
  );
}

beforeEach(() => {
  mockReset.mockClear();
  localStorage.setItem("locale", "es");
});

describe("RootError boundary", () => {
  it("renders default error message when no error message provided", () => {
    renderError(new Error());

    expect(screen.getByText(es.common.somethingWentWrong)).toBeInTheDocument();
    expect(screen.getByText(es.common.unexpectedError)).toBeInTheDocument();
  });

  it("renders the error message", () => {
    renderError(new Error("Database connection failed"));

    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("renders Try again and Go to Home buttons", () => {
    renderError(new Error("test error"));

    expect(screen.getByText(es.common.tryAgain)).toBeInTheDocument();
    expect(screen.getByText(es.common.goToHome)).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    renderError(new Error("test error"));

    await user.click(screen.getByText(es.common.tryAgain));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("has aria-hidden icon", () => {
    const { container } = renderError(new Error("test error"));

    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it("has link to home page", () => {
    renderError(new Error("test error"));

    const link = screen.getByText(es.common.goToHome).closest("a");
    expect(link).toHaveAttribute("href", "/");
  });
});
