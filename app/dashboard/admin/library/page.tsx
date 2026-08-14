"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import Card from "@/components/shared/Card";
import LibraryStatsCards from "@/components/dashboard/LibraryStatsCards";
import { getToken } from "@/lib/auth";
import { listBooks } from "@/lib/services/libraryService";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  status: string;
  available: number;
  total: number;
}

function mapBook(item: Record<string, unknown>): LibraryBook {
  return {
    id: String(item.id),
    title: String(item.title ?? item.book_title ?? item.name ?? "Untitled book"),
    author: String(item.author_name ?? item.author ?? "-"),
    category: String(item.category_name ?? item.category ?? "-"),
    status: String(item.status ?? "-"),
    available: Number(item.available_copies ?? 0),
    total: Number(item.total_copies ?? 0),
  };
}

export default function AdminLibraryPage() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      const token = getToken();
      if (!token) {
        setError("Please log in to view library records.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await listBooks(token);
        setBooks(data.map((item) => mapBook(item as Record<string, unknown>)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load library records.");
      } finally {
        setLoading(false);
      }
    };

    void fetchBooks();
  }, []);

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Library</h1>
              <p className="text-sm text-slate-600">Manage library catalog and circulation records.</p>
            </div>
          </div>

          <LibraryStatsCards />

          <Card className="p-0">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Book Catalog</h2>
            </div>

            {loading && (
              <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading books...
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-2 px-5 py-8 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {!loading && !error && books.length === 0 && (
              <div className="px-5 py-8 text-sm text-slate-600">
                No library books found.
              </div>
            )}

            {!loading && !error && books.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Author</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Availability</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id} className="border-b border-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-900">{book.title}</td>
                        <td className="px-5 py-3 text-slate-600">{book.author}</td>
                        <td className="px-5 py-3 text-slate-600">{book.category}</td>
                        <td className="px-5 py-3 text-slate-600">{book.available} / {book.total}</td>
                        <td className="px-5 py-3 text-slate-600">{book.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
