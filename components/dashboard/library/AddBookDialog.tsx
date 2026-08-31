"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import {
  createBook,
  listCategories,
  createCategory,
} from "@/lib/services/libraryService";
import type { BookCategoryResponse } from "@/types/entities/library";
import { Plus, BookPlus, Loader2 } from "lucide-react";

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export default function AddBookDialog({
  open,
  onClose,
  onSuccess,
  token,
}: AddBookDialogProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [language, setLanguage] = useState("English");
  const [edition, setEdition] = useState("");
  const [rackNumber, setRackNumber] = useState("");
  const [shelfNumber, setShelfNumber] = useState("");
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<BookCategoryResponse[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setTitle("");
    setAuthor("");
    setIsbn("");
    setCategoryId("");
    setTotalCopies(1);
    setLanguage("English");
    setEdition("");
    setRackNumber("");
    setShelfNumber("");
    setDescription("");
    setIsCreatingCategory(false);
    setNewCategoryName("");

    const loadCats = async () => {
      setLoadingCategories(true);
      try {
        const data = await listCategories(token);
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCats();
  }, [open, token]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setSubmitting(true);
      const cat = await createCategory(token, {
        category_name: newCategoryName.trim(),
      });
      setCategories((prev) => [...prev, cat]);
      setCategoryId(cat.id);
      setNewCategoryName("");
      setIsCreatingCategory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Book title is required.");
      return;
    }
    if (!author.trim()) {
      setError("Author name is required.");
      return;
    }
    if (!isbn.trim()) {
      setError("ISBN is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select or create a book category.");
      return;
    }
    if (totalCopies <= 0) {
      setError("Total copies must be at least 1.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createBook(token, {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category_id: categoryId,
        total_copies: Number(totalCopies),
        available_copies: Number(totalCopies),
        language: language.trim() || "English",
        edition: edition.trim() || null,
        rack_number: rackNumber.trim() || null,
        shelf_number: shelfNumber.trim() || null,
        description: description.trim() || null,
        status: true,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add book.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Book to Catalog" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., To Kill a Mockingbird"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Harper Lee"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ISBN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g., 978-0-06-112008-4"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              {!isCreatingCategory && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> New Category
                </button>
              )}
            </div>

            {isCreatingCategory ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name (e.g., Science Fiction)"
                  className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={submitting || !newCategoryName.trim()}
                  className="h-10 rounded-lg bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {categories.length === 0 ? (
                  <option value="">No categories found (Click + New Category)</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Copies <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={totalCopies}
              onChange={(e) => setTotalCopies(parseInt(e.target.value, 10) || 1)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g., English"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Edition</label>
            <input
              type="text"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="e.g., 3rd Edition"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rack</label>
              <input
                type="text"
                value={rackNumber}
                onChange={(e) => setRackNumber(e.target.value)}
                placeholder="Rack #"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf</label>
              <input
                type="text"
                value={shelfNumber}
                onChange={(e) => setShelfNumber(e.target.value)}
                placeholder="Shelf #"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Summary</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the book..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Book...
              </>
            ) : (
              <>
                <BookPlus className="h-4 w-4" />
                Add Book
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
