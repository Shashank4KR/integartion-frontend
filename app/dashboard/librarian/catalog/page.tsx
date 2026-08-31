"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboardLayout from "@/components/dashboard/role-dashboards/RoleDashboardLayout";
import { ROLE_CONFIGS } from "@/lib/dashboard/role-dashboards/config";
import { getToken, getStoredUser } from "@/lib/auth";
import { listBooks, listCategories, deleteBook } from "@/lib/services/libraryService";
import type { BookResponse, BookCategoryResponse } from "@/types/entities/library";
import Card from "@/components/shared/Card";
import AddBookDialog from "@/components/dashboard/library/AddBookDialog";
import IssueBookDialog from "@/components/dashboard/library/IssueBookDialog";
import {
  Loader2,
  AlertCircle,
  Library,
  Plus,
  BookMarked,
  Search,
  Trash2,
  BookOpen,
} from "lucide-react";

export default function CatalogPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [categories, setCategories] = useState<BookCategoryResponse[]>([]);

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
      console.error("Error fetching catalog:", err);
      setError(err instanceof Error ? err.message : "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const activeToken = getToken();
    const user = getStoredUser();

    if (!activeToken || !user) {
      router.replace("/login");
      return;
    }

    setToken(activeToken);
    void fetchCatalog(activeToken);
  }, [router, fetchCatalog]);

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete "${title}" from the catalog?`)) return;

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
    <RoleDashboardLayout config={ROLE_CONFIGS.librarian}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Library className="h-8 w-8 text-purple-600" />
              Book Catalog
            </h1>
            <p className="text-slate-600 mt-1">Browse, add, and lend books in the library collection</p>
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

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
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

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-slate-600">Loading catalog...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <Card className="border-amber-200 bg-amber-50 p-8 text-center">
            <div className="flex flex-col items-center gap-3 text-amber-800">
              <BookOpen className="h-10 w-10 text-amber-600" />
              <p className="text-base font-semibold">No books found.</p>
              <p className="text-sm text-amber-700">
                {searchQuery || selectedCategory
                  ? "Try adjusting your search criteria or category filter."
                  : "Start by clicking '+ Add Book' to populate the catalog."}
              </p>
              {!searchQuery && !selectedCategory && (
                <button
                  onClick={() => setAddBookOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" /> Add First Book
                </button>
              )}
            </div>
          </Card>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => {
              const isAvailable = book.available_copies > 0;
              return (
                <Card key={book.id} className="hover:shadow-lg transition flex flex-col justify-between p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 mb-1.5">
                          {getCategoryName(book.category_id)}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                          {book.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">by {book.author}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        disabled={deletingId === book.id}
                        title="Delete Book"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        {deletingId === book.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {book.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{book.description}</p>
                    )}

                    <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">ISBN:</span>
                        <span className="font-mono text-slate-700">{book.isbn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-700">
                          {book.rack_number || book.shelf_number
                            ? `Rack ${book.rack_number || "-"}, Shelf ${book.shelf_number || "-"}`
                            : "Standard Stack"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500">Copies:</span>
                        <span
                          className={`font-semibold ${
                            isAvailable ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {book.available_copies} of {book.total_copies} available
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isAvailable
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {isAvailable ? "In Stock" : "Checked Out"}
                    </span>

                    <button
                      onClick={() => handleOpenIssueModal(book.id)}
                      disabled={!isAvailable}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <BookMarked className="h-3.5 w-3.5" />
                      Lend Book
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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
    </RoleDashboardLayout>
  );
}
