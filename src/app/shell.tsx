import { Navbar } from "@/components/navbar";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Chinese Flashcards App - Learn Chinese characters efficiently</p>
        </div>
      </footer>
    </div>
  );
} 