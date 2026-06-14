import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import {
  Skeleton,
  CardSkeleton,
  ListPageSkeleton,
  DetailPageSkeleton,
  FormPageSkeleton,
  SettingsPageSkeleton,
} from "@/components/ui/Skeleton";

describe("Skeleton components", () => {
  describe("Skeleton", () => {
    it("renders with default role and label", () => {
      render(<Skeleton />);
      const el = screen.getByRole("status");
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("aria-label", "Loading");
    });

    it("applies custom className", () => {
      render(<Skeleton className="w-40 h-8" />);
      const el = screen.getByRole("status");
      expect(el.className).toContain("w-40");
      expect(el.className).toContain("h-8");
    });
  });

  describe("CardSkeleton", () => {
    it("renders without crashing", () => {
      const { container } = render(<CardSkeleton />);
      expect(container.querySelector(".rounded-xl")).toBeInTheDocument();
    });

    it("contains multiple skeleton children", () => {
      render(<CardSkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(5);
    });
  });

  describe("ListPageSkeleton", () => {
    it("renders without crashing", () => {
      const { container } = render(<ListPageSkeleton />);
      expect(container.querySelector(".max-w-7xl")).toBeInTheDocument();
    });

    it("renders many skeleton indicators", () => {
      render(<ListPageSkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(10);
    });
  });

  describe("DetailPageSkeleton", () => {
    it("renders without crashing", () => {
      const { container } = render(<DetailPageSkeleton />);
      expect(container.querySelector(".lg\\:col-span-2")).toBeInTheDocument();
    });
  });

  describe("FormPageSkeleton", () => {
    it("renders without crashing", () => {
      const { container } = render(<FormPageSkeleton />);
      expect(container.querySelector(".max-w-3xl")).toBeInTheDocument();
    });
  });

  describe("SettingsPageSkeleton", () => {
    it("renders without crashing", () => {
      const { container } = render(<SettingsPageSkeleton />);
      expect(container.querySelector(".max-w-4xl")).toBeInTheDocument();
    });
  });
});
