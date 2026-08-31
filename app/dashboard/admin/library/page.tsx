"use client";

import { useCallback, useEffect, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import Card from "@/components/shared/Card";
import LibraryStatsCards from "@/components/dashboard/LibraryStatsCards";
import AddBookDialog from "@/components/dashboard/library/AddBookDialog";
import IssueBookDialog from "@/components/dashboard/library/IssueBookDialog";
import { getToken } from "@/lib/auth";
import { listBooks, listCategories, deleteBook } from "@/lib/services/libraryService";
import type { BookResponse, BookCategoryResponse } from "@/types/entities/library";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  Plus,
  BookMarked,
  Search,
  Trash2,
} from "lucide-react";

export default function AdminLibraryPage() {
  const [token, setToken] = useState<string | null>(null);
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [categories, setCategories] = useState<BookCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueBookOpen, setIssueBookOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<string | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCatalog = useCallback(async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const [bookList, categoryList] = await Promise.all([
        listBooks(authToken),
        listCategories(authToken).catch(() => []),
      ]);
      setBooks(bookList);
      setCategories(categoryList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const activeToken = getToken();
    if (!activeToken) {
      setError("Please log in to view library records.");
      setLoading(false);
      return;
    }

    setToken(activeToken);
    void fetchCatalog(activeToken);
  }, [fetchCatalog]);

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(bookId);
    try {
      await deleteBook(token, bookId);
      await fetchCatalog(token);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete book");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenIssueModal = (bookId?: string) => {
    setSelectedBookForIssue(bookId);
    setIssueBookOpen(true);
  };

  const filteredBooks = books.filter((book) => {
    if (selectedCategory && book.category_id !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const t = (book.title ?? "").toLowerCase();
    const a = (book.author ?? "").toLowerCase();
    const i = (book.isbn ?? "").toLowerCase();
    return t.includes(q) || a.includes(q) || i.includes(q);
  });

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.category_name : "General";
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-6">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-3">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Library Management</h1>
                <p className="text-sm text-slate-600">Manage library catalog, circulation records, and book loans.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenIssueModal()}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition shadow-sm"
              >
                <BookMarked className="h-4 w-4" />
                Lend Book
              </button>
              <button
                onClick={() => setAddBookOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Book
              </button>
            </div>
          </div>

          <LibraryStatsCards />

          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card className="p-0 border border-slate-200">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Book Catalog</h2>
              <span className="text-xs text-slate-500">{filteredBooks.length} titles</span>
            </div>

            {loading && (
              <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                Loading books...
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-2 px-5 py-8 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {!loading && !error && filteredBooks.length === 0 && (
              <div className="px-5 py-8 text-sm text-slate-600 text-center">
                No library books found.
              </div>
            )}

            {!loading && !error && filteredBooks.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-700">
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Title</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Author</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Category</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">ISBN</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Availability</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Status</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBooks.map((book) => {
                      const isAvailable = book.available_copies > 0;
                      return (
                        <tr key={book.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3.5 font-medium text-slate-900">{book.title}</td>
                          <td className="px-5 py-3.5 text-slate-600">{book.author}</td>
                          <td className="px-5 py-3.5">
                            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                              {getCategoryName(book.category_id)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{book.isbn}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`font-semibold ${
                                isAvailable ? "text-emerald-700" : "text-red-600"
                              }`}
                            >
                              {book.available_copies} / {book.total_copies}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isAvailable
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {isAvailable ? "In Stock" : "Checked Out"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleOpenIssueModal(book.id)}
                                disabled={!isAvailable}
                                className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-40 transition"
                              >
                                Lend
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book.id, book.title)}
                                disabled={deletingId === book.id}
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                                title="Delete"
                              >
                                {deletingId === book.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {token && (
        <>
          <AddBookDialog
            open={addBookOpen}
            onClose={() => setAddBookOpen(false)}
            onSuccess={() => void fetchCatalog(token)}
            token={token}
          />
          <IssueBookDialog
            open={issueBookOpen}
            onClose={() => setIssueBookOpen(false)}
            onSuccess={() => void fetchCatalog(token)}
            token={token}
            defaultBookId={selectedBookForIssue}
          />
        </>
      )}
    </MainLayout>
  );
}
