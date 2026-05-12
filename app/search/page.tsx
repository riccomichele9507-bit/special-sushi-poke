import type { Metadata } from "next";
import { SearchClient } from "./client";

export const metadata: Metadata = {
  title: "Cerca",
  description: "Cerca un piatto nel menu di Special Sushi Poke.",
};

export default function SearchPage() {
  return <SearchClient />;
}
