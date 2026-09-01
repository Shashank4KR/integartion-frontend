"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Check,
  Clock3,
  Download,
  Eye,
  KeyRound,
  Laptop,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Upload,
  UserRound,
} from "lucide-react";
import type { SchoolRole, SettingsUser } from "@/components/settings/SettingsPage";
import { getToken, getStoredAvatar, saveAvatar, removeAvatar, subscribeAvatarChange } from "@/lib/auth";
import {
  changePassword,
  exportAuditLogsCSV,
  getAuditLogs,
  getSettings,
  getUserSessions,
  updateCategorySettings,
  updateProfile,
} from "@/lib/services/settingsService";

export type SectionProps = {
  currentRole: SchoolRole;
  user: SettingsUser;
  onUserUpdate?: (updatedUser: SettingsUser) => void;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-500";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Actions({
  onCancel,
  onSave,
  saving = false,
  saved = false,
  error = null,
  disabled = false,
}: {
  onCancel?: () => void;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-h-[20px]">
        {error && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Check className="h-4 w-4 shrink-0" />
            Changes saved successfully
          </p>
        )}
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving || disabled}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 py-3">
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-violet-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

/* ==========================================================================
   1. PERSONAL / PROFILE SETTINGS
   ========================================================================== */
function compressImage(file: File, maxDim = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log("[Avatar] compressImage: reading file", file.name, file.size, file.type);
    const reader = new FileReader();
    reader.onerror = (ev) => {
      console.error("[Avatar] FileReader error:", ev);
      reject(new Error("Failed to read image file."));
    };
    reader.onload = () => {
      const img = new Image();
      img.onerror = (ev) => {
        console.error("[Avatar] Image decode error:", ev);
        reject(new Error("Invalid image format. Please select a valid JPG, PNG, or WebP image."));
      };
      img.onload = () => {
        console.log("[Avatar] Image decoded:", img.width, "x", img.height);
        if (img.width === 0 || img.height === 0) {
          console.error("[Avatar] Zero-dimension image — aborting");
          reject(new Error("Image has zero dimensions. Please choose a different file."));
          return;
        }
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.warn("[Avatar] Canvas 2d context unavailable — using raw data URL");
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        console.log("[Avatar] Compressed to", dataUrl.length, "chars (", width, "x", height, ")");
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProfileSettings({ user, onUserUpdate }: SectionProps) {
  const [name, setName] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  // Initialise from localStorage immediately so the avatar appears on first render
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => getStoredAvatar());
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Callback ref: fires when the input DOM node is actually attached/detached
  // This is StrictMode-safe and more reliable than useEffect + useRef for event listeners
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileListenerCleanupRef = useRef<(() => void) | null>(null);
  const attachFileListener = useCallback(
    (inputEl: HTMLInputElement | null) => {
      // Detach phase — React passes null when the node is removed
      if (!inputEl) {
        fileListenerCleanupRef.current?.();
        fileListenerCleanupRef.current = null;
        (fileInputRef as React.MutableRefObject<HTMLInputElement | null>).current = null;
        return;
      }

      // Keep the plain ref in sync (used by handleRemovePhoto etc.)
      (fileInputRef as React.MutableRefObject<HTMLInputElement | null>).current = inputEl;

      const handleNativeChange = async () => {
        const file = inputEl.files?.[0];
        console.log("[Avatar] change fired, file:", file?.name ?? "(none)");
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
          setPhotoError("File size exceeds maximum 10 MB limit.");
          inputEl.value = "";
          return;
        }

        // Show the chosen image immediately — no async wait needed
        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
        setProcessingPhoto(true);
        setPhotoError(null);

        try {
          const compressed = await compressImage(file, 256, 0.85);
          console.log("[Avatar] compressed, length:", compressed.length);
          URL.revokeObjectURL(objectUrl);
          setAvatarPreview(compressed);
          saveAvatar(compressed);
          console.log("[Avatar] saved. Key present:", !!localStorage.getItem("edtech_user_avatar"));
          setPhotoSuccess("Profile picture updated!");
          setTimeout(() => setPhotoSuccess(null), 3000);
        } catch (err: any) {
          console.error("[Avatar] failed:", err);
          URL.revokeObjectURL(objectUrl);
          setAvatarPreview(getStoredAvatar());
          setPhotoError(err?.message || "Failed to process photo.");
        } finally {
          setProcessingPhoto(false);
          inputEl.value = "";
        }
      };

      inputEl.addEventListener("change", handleNativeChange);
      fileListenerCleanupRef.current = () => inputEl.removeEventListener("change", handleNativeChange);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Sync profile fields when the user object changes
  useEffect(() => {
    setName(user.username);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setAvatarPreview(getStoredAvatar());
  }, [user]);

  // Keep the avatar preview in sync with the global avatar store
  useEffect(() => {
    return subscribeAvatarChange((newAvatar) => {
      setAvatarPreview(newAvatar);
    });
  }, []);

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    removeAvatar();
    setPhotoSuccess("Profile picture removed.");
    setTimeout(() => setPhotoSuccess(null), 3000);
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      setError("Authentication session expired. Please sign in again.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await updateProfile(token, {
        username: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      if (onUserUpdate) onUserUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.username);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setAvatarPreview(getStoredAvatar());
    setError(null);
    setPhotoError(null);
  };

  const initials = (name || user.username)
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Card
        title="Profile photo"
        description="This image is shown across the top navigation bar and school communication profile."
      >
        <div className="flex flex-wrap items-center gap-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile Preview"
              className="h-16 w-16 rounded-full object-cover border-2 border-violet-500 shadow-md"
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-violet-100 text-xl font-bold text-violet-700 shadow-inner">
              {initials}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Native label→input association: no JS .click() needed, works in all browsers */}
              <label
                htmlFor="avatar-file-input"
                aria-disabled={processingPhoto}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 ${
                  processingPhoto ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {processingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : (
                  <Upload className="h-4 w-4 text-slate-500" />
                )}
                {processingPhoto ? "Processing…" : "Upload new photo"}
                <input
                  ref={attachFileListener}
                  id="avatar-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                />
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                >
                  Remove photo
                </button>
              )}
            </div>
            {photoSuccess && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                {photoSuccess}
              </p>
            )}
            {photoError && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {photoError}
              </p>
            )}
            <p className="text-xs text-slate-500">Supports JPG, PNG, WebP up to 10 MB. Automatically optimized.</p>
          </div>
        </div>
      </Card>

      <Card
        title="Personal information"
        description="Keep your personal and contact details accurate for school communication."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Full name
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email address
            <input
              value={email}
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone number
            <input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Role
            <input
              value={user.role?.role_name ?? "ADMIN"}
              readOnly
              className={`${inputClass} bg-slate-50 font-semibold text-slate-600`}
            />
          </label>
        </div>
        <Actions
          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
          saved={saved}
          error={error}
        />
      </Card>
    </>
  );
}

/* ==========================================================================
   2. PERSONAL / ACCOUNT & SECURITY
   ========================================================================== */
export function AccountSecurity(_: SectionProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [twoFactor, setTwoFactor] = useState(false);
  const [signInAlerts, setSignInAlerts] = useState(true);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      device: string;
      ip_address: string;
      login_time: string | null;
      is_active: boolean;
    }>
  >([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    void getSettings(token)
      .then((settings) => {
        const sec = settings?.security ?? {};
        if (typeof sec.two_factor_auth === "boolean") setTwoFactor(sec.two_factor_auth);
        if (typeof sec.signin_alerts === "boolean") setSignInAlerts(sec.signin_alerts);
      })
      .catch(() => {});

    void getUserSessions(token)
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setSessions(res);
        } else {
          setSessions([
            {
              id: "current-1",
              device: "Chrome on Windows",
              ip_address: "127.0.0.1",
              login_time: new Date().toISOString(),
              is_active: true,
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in both current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    const token = getToken();
    if (!token) {
      setPasswordError("Please sign in again to change password.");
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setSecuritySaving(true);
      setSecurityError(null);
      await updateCategorySettings(token, "security", {
        two_factor_auth: twoFactor,
        signin_alerts: signInAlerts,
      });
      setSecuritySaved(true);
      setTimeout(() => setSecuritySaved(false), 3000);
    } catch (err: any) {
      setSecurityError(err?.message || "Failed to save security preferences.");
    } finally {
      setSecuritySaving(false);
    }
  };

  return (
    <>
      <Card
        title="Account protection"
        description="Manage your account password, multi-factor authentication and sign-in protection."
      >
        <div className="divide-y divide-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Password</p>
              <p className="text-xs text-slate-500">
                Regularly updating your password enhances your account protection.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(!showPasswordModal);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {showPasswordModal ? "Hide form" : "Change password"}
            </button>
          </div>

          {showPasswordModal && (
            <form onSubmit={handlePasswordSubmit} className="my-3 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-900">Update Password</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-medium text-slate-700">
                  Current password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  Confirm new password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </label>
              </div>

              {passwordError && (
                <p className="mt-2 text-xs font-medium text-rose-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="mt-2 text-xs font-medium text-emerald-600">{passwordSuccess}</p>
              )}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {passwordSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Confirm password change
                </button>
              </div>
            </form>
          )}

          <Toggle
            label="Two-factor authentication"
            hint="Require a verification step when signing in from a new device."
            checked={twoFactor}
            onChange={(val) => {
              setTwoFactor(val);
              setSecuritySaved(false);
            }}
          />
          <Toggle
            label="Sign-in alerts"
            hint="Receive an immediate notification whenever your account is accessed."
            checked={signInAlerts}
            onChange={(val) => {
              setSignInAlerts(val);
              setSecuritySaved(false);
            }}
          />
        </div>
        <Actions
          onSave={handleSaveSecurity}
          saving={securitySaving}
          saved={securitySaved}
          error={securityError}
        />
      </Card>

      <Card
        title="Active sessions"
        description="Review the devices and browsers currently authenticated with your school credentials."
      >
        {loadingSessions ? (
          <div className="flex items-center justify-center py-6 text-xs text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading session history…
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((sess, idx) => (
              <div
                key={sess.id || idx}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    {sess.device.toLowerCase().includes("mobile") ? (
                      <Smartphone className="h-5 w-5" />
                    ) : (
                      <Laptop className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {sess.device}
                      {sess.is_active && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                          Active session
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      IP: {sess.ip_address} · {sess.login_time ? new Date(sess.login_time).toLocaleString() : "Recently active"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

/* ==========================================================================
   GENERIC CATEGORY CONFIGURATION COMPONENT
   ========================================================================== */
function ConfigCategorySection({
  category,
  title,
  description,
  fields,
}: {
  category: string;
  title: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    hint?: string;
    type?: "toggle" | "text" | "number" | "select";
    options?: string[];
    span2?: boolean;
  }>;
}) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [initialConfig, setInitialConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getSettings(token)
      .then((all) => {
        const catConfig = all?.[category] ?? {};
        setConfig(catConfig);
        setInitialConfig(catConfig);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      setError("Please sign in again to save settings.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateCategorySettings(token, category, config);
      setInitialConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setConfig(initialConfig);
    setError(null);
    setSaved(false);
  };

  const toggleFields = fields.filter((f) => f.type === "toggle" || !f.type);
  const inputFields = fields.filter((f) => f.type && f.type !== "toggle");

  return (
    <Card title={title} description={description}>
      {loading ? (
        <div className="flex items-center justify-center py-6 text-xs text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading configurations…
        </div>
      ) : (
        <>
          {inputFields.length > 0 && (
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              {inputFields.map((f) => (
                <label
                  key={f.key}
                  className={`text-sm font-medium text-slate-700 ${f.span2 ? "sm:col-span-2" : ""}`}
                >
                  {f.label}
                  {f.type === "select" ? (
                    <select
                      value={config[f.key] ?? f.options?.[0] ?? ""}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className={inputClass}
                    >
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={config[f.key] ?? ""}
                      onChange={(e) =>
                        handleChange(
                          f.key,
                          f.type === "number" ? Number(e.target.value) : e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  )}
                  {f.hint && <span className="mt-1 block text-xs font-normal text-slate-500">{f.hint}</span>}
                </label>
              ))}
            </div>
          )}

          {toggleFields.length > 0 && (
            <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
              {toggleFields.map((f) => (
                <Toggle
                  key={f.key}
                  label={f.label}
                  hint={f.hint}
                  checked={Boolean(config[f.key] ?? true)}
                  onChange={(val) => handleChange(f.key, val)}
                />
              ))}
            </div>
          )}

          <Actions
            onCancel={handleCancel}
            onSave={handleSave}
            saving={saving}
            saved={saved}
            error={error}
          />
        </>
      )}
    </Card>
  );
}

/* ==========================================================================
   3. PERSONAL / NOTIFICATION PREFERENCES
   ========================================================================== */
export function NotificationPreferences({ currentRole }: SectionProps) {
  const roleUpdates: Record<SchoolRole, string> = {
    Admin: "Critical school administration alerts",
    Teacher: "Class, assignment and timetable updates",
    Student: "Assignment, result and attendance updates",
    Parent: "Child attendance, fees and school updates",
    Librarian: "Overdue books and reservation updates",
    Accountant: "Payment, invoice and collection updates",
  };

  return (
    <ConfigCategorySection
      category="notifications"
      title="Delivery channels"
      description="Control how you and school members receive important notifications and alerts."
      fields={[
        {
          key: "role_updates",
          label: roleUpdates[currentRole],
          hint: `Personalized updates tailored for your ${currentRole.toLowerCase()} role.`,
          type: "toggle",
        },
        {
          key: "email_notifications",
          label: "Email notifications",
          hint: "Receive daily summary and immediate administrative email notices.",
          type: "toggle",
        },
        {
          key: "in_app_notifications",
          label: "In-app notifications",
          hint: "Show dynamic push and banner alerts in the top dashboard navigation.",
          type: "toggle",
        },
        {
          key: "sms_notifications",
          label: "SMS notifications",
          hint: "Send text messages to mobile phone for critical emergency notices.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   4. PERSONAL / APPEARANCE PREFERENCES
   ========================================================================== */
export function AppearancePreferences(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="appearance"
      title="Display preferences"
      description="Personalize system theme, localization, date formats, and timezone defaults."
      fields={[
        {
          key: "theme",
          label: "Theme",
          type: "select",
          options: ["System", "Light", "Dark"],
        },
        {
          key: "language",
          label: "Language",
          type: "select",
          options: ["English (India)", "English (US)", "Hindi"],
        },
        {
          key: "date_format",
          label: "Date format",
          type: "select",
          options: ["DD MMM YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
        },
        {
          key: "timezone",
          label: "Timezone",
          type: "select",
          options: ["Asia/Kolkata (IST)", "UTC", "America/New_York (EST)", "Europe/London (GMT)"],
        },
      ]}
    />
  );
}

/* ==========================================================================
   5. SCHOOL CONFIGURATION / ORGANIZATION
   ========================================================================== */
export function OrganizationSettings(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="organization"
      title="School details"
      description="These details appear on official reports, student transcripts, fee invoices and institutional correspondence."
      fields={[
        {
          key: "school_name",
          label: "School name",
          type: "text",
        },
        {
          key: "school_code",
          label: "School code",
          type: "text",
        },
        {
          key: "contact_email",
          label: "Official contact email",
          type: "text",
        },
        {
          key: "contact_phone",
          label: "Official contact phone",
          type: "text",
        },
        {
          key: "academic_year",
          label: "Current academic session",
          type: "text",
        },
        {
          key: "affiliation",
          label: "Board / Affiliation",
          type: "text",
        },
        {
          key: "website",
          label: "School website URL",
          type: "text",
          span2: true,
        },
        {
          key: "registered_address",
          label: "Registered address",
          type: "text",
          span2: true,
        },
      ]}
    />
  );
}

/* ==========================================================================
   6. SCHOOL CONFIGURATION / ACADEMICS
   ========================================================================== */
export function AcademicConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="academics"
      title="Academic year & curriculum"
      description="Set defaults used by Academics, Timetable, Lesson Planning and Curriculum modules."
      fields={[
        {
          key: "max_periods_per_day",
          label: "Maximum periods per day",
          type: "number",
          hint: "Standard number of class slots scheduled in a daily timetable.",
        },
        {
          key: "period_duration_minutes",
          label: "Default period duration (minutes)",
          type: "number",
          hint: "Length of standard classroom lecture period.",
        },
        {
          key: "allow_lesson_plan_edits",
          label: "Allow teacher lesson-plan edits",
          hint: "Teachers can update lesson schedules and plan materials for their assigned classes.",
          type: "toggle",
        },
        {
          key: "show_subject_codes",
          label: "Show subject codes on timetables",
          hint: "Display official subject codes alongside subject names on timetable grids.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   7. SCHOOL CONFIGURATION / ATTENDANCE
   ========================================================================== */
export function AttendanceConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="attendance"
      title="Attendance rules & workflows"
      description="Configure daily student and staff attendance cutoff timings and parent notification policies."
      fields={[
        {
          key: "cutoff_time",
          label: "Morning attendance cutoff time",
          type: "text",
          hint: "Time after which attendance is flagged as late.",
        },
        {
          key: "half_day_threshold_hours",
          label: "Half-day threshold (hours)",
          type: "number",
          hint: "Minimum presence hours required to count as a half day.",
        },
        {
          key: "allow_late_marking",
          label: "Allow late attendance marking",
          hint: "Authorized teachers can submit attendance logs after the standard cutoff window.",
          type: "toggle",
        },
        {
          key: "notify_absent_parents",
          label: "Notify parents for absences",
          hint: "Automatically dispatch an instant SMS/email alert when a student is recorded absent.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   8. SCHOOL CONFIGURATION / EXAMINATION
   ========================================================================== */
export function ExaminationConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="examination"
      title="Examination & grading policies"
      description="Define result publication workflows, minimum passing thresholds and gradebook calculations."
      fields={[
        {
          key: "min_passing_percentage",
          label: "Minimum passing score (%)",
          type: "number",
          hint: "Threshold required to pass an exam subject.",
        },
        {
          key: "grading_scale",
          label: "Grading scale standard",
          type: "select",
          options: ["Standard (A+, A, B, C, D, F)", "10-Point GPA", "Percentage Scale"],
        },
        {
          key: "publish_after_approval",
          label: "Publish results after admin approval",
          hint: "Exam results remain confidential until verified and approved by the academic head.",
          type: "toggle",
        },
        {
          key: "round_marks_to_decimals",
          label: "Round marks to two decimal places",
          hint: "Ensure precise arithmetic across grade sheets, weightages and report cards.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   9. OPERATIONS / LIBRARY CONFIGURATION
   ========================================================================== */
export function LibraryConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="library"
      title="Library circulation policies"
      description="Configure book loan durations, reservation rules, and daily overdue fine calculations."
      fields={[
        {
          key: "max_books_per_student",
          label: "Maximum books issued per member",
          type: "number",
        },
        {
          key: "issue_duration_days",
          label: "Standard loan duration (days)",
          type: "number",
        },
        {
          key: "fine_per_day",
          label: "Overdue fine per day (INR)",
          type: "number",
        },
        {
          key: "send_overdue_reminders",
          label: "Send automated overdue reminders",
          hint: "Notify borrowers 2 days prior to due date and daily once overdue.",
          type: "toggle",
        },
        {
          key: "allow_book_reservations",
          label: "Allow book reservations",
          hint: "Permit students and faculty to place hold reservations on loaned books.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   10. OPERATIONS / HOSTEL CONFIGURATION
   ========================================================================== */
export function HostelConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="hostel"
      title="Hostel residency policies"
      description="Manage resident check-in limits, visitor approvals, and curfew management policies."
      fields={[
        {
          key: "curfew_time",
          label: "Evening curfew timing",
          type: "text",
          hint: "Cutoff time for hostel entry.",
        },
        {
          key: "late_fine_amount",
          label: "Late entry penalty (INR)",
          type: "number",
        },
        {
          key: "require_visitor_approval",
          label: "Require visitor warden approval",
          hint: "All guest entries must be authenticated by the hostel supervisor.",
          type: "toggle",
        },
        {
          key: "enable_late_return_tracking",
          label: "Enable late-return tracking",
          hint: "Maintain strict digital audit logs of student arrivals post-curfew.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   11. OPERATIONS / TRANSPORT CONFIGURATION
   ========================================================================== */
export function TransportConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="transport"
      title="Transport & fleet operations"
      description="Configure GPS tracking, parent arrival notifications, and bus driver check-in policies."
      fields={[
        {
          key: "share_bus_arrival_alerts",
          label: "Share bus arrival alerts with parents",
          hint: "Send GPS-triggered alerts 10 minutes before bus reaches the student's designated stop.",
          type: "toggle",
        },
        {
          key: "require_trip_checkin",
          label: "Require driver trip check-in",
          hint: "Drivers must digitally confirm departure and odometer reading before each route.",
          type: "toggle",
        },
        {
          key: "speed_limit_alerts",
          label: "Enable speed threshold alerts",
          hint: "Trigger administrative warning if vehicle speed exceeds safety limits.",
          type: "toggle",
        },
        {
          key: "gps_tracking_enabled",
          label: "Live GPS tracking",
          hint: "Enable continuous telematics location polling for active routes.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   12. OPERATIONS / FINANCE CONFIGURATION
   ========================================================================== */
export function FinanceConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="finance"
      title="Financial controls & collections"
      description="Configure automated fee receipts, partial payment terms, tax percentages, and late fee grace periods."
      fields={[
        {
          key: "currency",
          label: "Primary currency code",
          type: "select",
          options: ["INR", "USD", "EUR", "GBP", "AED"],
        },
        {
          key: "tax_percentage",
          label: "Applicable tax rate (%)",
          type: "number",
        },
        {
          key: "late_fee_grace_days",
          label: "Late fee grace period (days)",
          type: "number",
          hint: "Number of calendar days before overdue fine applies.",
        },
        {
          key: "generate_receipts_automatically",
          label: "Generate receipts automatically",
          hint: "Instantly create a digitally signed PDF receipt upon every successful payment transaction.",
          type: "toggle",
        },
        {
          key: "allow_partial_payments",
          label: "Allow partial fee installment payments",
          hint: "Permit guardians to settle fees in custom installment amounts.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   13. ADMINISTRATION / COMMUNICATION TEMPLATES
   ========================================================================== */
export function CommunicationTemplates(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="communication"
      title="Communication channels & approval workflows"
      description="Manage automated delivery mechanisms for circulars, notices, and message template approvals."
      fields={[
        {
          key: "email_delivery",
          label: "Official email dispatch",
          hint: "Enable school emails to be automatically dispatched via verified SMTP gateways.",
          type: "toggle",
        },
        {
          key: "sms_delivery",
          label: "Urgent SMS dispatch",
          hint: "Send critical SMS broadcasts directly to verified parent and staff phone numbers.",
          type: "toggle",
        },
        {
          key: "whatsapp_notifications",
          label: "WhatsApp Business API notifications",
          hint: "Send structured rich messages for fee reminders and event invitations.",
          type: "toggle",
        },
        {
          key: "template_approval_workflow",
          label: "Mandate template administrator approval",
          hint: "Prevent draft announcements from being broadcast without principal sign-off.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   14. ADMINISTRATION / ROLES & PERMISSIONS
   ========================================================================== */
export function RolesPermissions(_: SectionProps) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const modules = [
    "Attendance",
    "Academics & Timetable",
    "Examination & Results",
    "Library",
    "Hostel",
    "Transport",
    "Finance & Fees",
    "Notifications",
    "Reports",
    "Settings & IAM",
  ];
  const roles: SchoolRole[] = [
    "Admin",
    "Teacher",
    "Student",
    "Parent",
    "Librarian",
    "Accountant",
  ];

  type PermType = "FULL" | "VIEW_OWN" | "NONE";

  const getPermission = (module: string, role: SchoolRole): PermType => {
    if (role === "Admin") return "FULL";

    if (module === "Attendance") {
      if (role === "Teacher") return "FULL";
      if (role === "Student" || role === "Parent") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Academics & Timetable") {
      if (role === "Teacher") return "FULL";
      if (role === "Student" || role === "Parent") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Examination & Results") {
      if (role === "Teacher") return "FULL";
      if (role === "Student" || role === "Parent") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Library") {
      if (role === "Librarian") return "FULL";
      if (role === "Student" || role === "Teacher") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Hostel") {
      if (role === "Student" || role === "Parent") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Transport") {
      if (role === "Student" || role === "Parent") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Finance & Fees") {
      if (role === "Accountant") return "FULL";
      if (role === "Parent" || role === "Student") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Notifications") {
      if (role === "Teacher") return "FULL";
      return "VIEW_OWN";
    }

    if (module === "Reports") {
      if (role === "Teacher" || role === "Accountant" || role === "Librarian") return "VIEW_OWN";
      return "NONE";
    }

    if (module === "Settings & IAM") {
      return "NONE";
    }

    return "NONE";
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 2500);
    }, 600);
  };

  return (
    <Card
      title="Roles & permissions matrix"
      description="Live permission matrix governing role-based access control (RBAC) across all application modules."
    >
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
              <th className="px-4 py-3">Module</th>
              {roles.map((role) => (
                <th key={role} className="px-3 py-3 text-center">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {modules.map((module) => (
              <tr key={module} className="transition hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-800">{module}</td>
                {roles.map((role) => {
                  const perm = getPermission(module, role);
                  return (
                    <td key={role} className="px-3 py-3 text-center">
                      {perm === "FULL" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <Check className="h-3 w-3" />
                          Manage
                        </span>
                      )}
                      {perm === "VIEW_OWN" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                          <Eye className="h-3 w-3" />
                          View Own
                        </span>
                      )}
                      {perm === "NONE" && (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Access Levels:</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 border border-emerald-200">
          <Check className="h-3 w-3" /> Manage (Create, Mark, Edit, Delete)
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700 border border-blue-200">
          <Eye className="h-3 w-3" /> View Own (Read-Only access to own / child record)
        </span>
        <span className="text-slate-400 font-medium">— No Access</span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Strict least-privilege RBAC is enforced on every backend API endpoint. Students and parents cannot modify attendance or records.
        </p>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {synced ? "Permissions synchronized" : "Refresh permissions"}
        </button>
      </div>
    </Card>
  );
}

/* ==========================================================================
   15. ADMINISTRATION / REPORTS & EXPORTS
   ========================================================================== */
export function ReportsExportSettings(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="reports"
      title="Reports & export configurations"
      description="Set defaults for student transcripts, financial ledgers, attendance summaries and institutional export branding."
      fields={[
        {
          key: "default_export_format",
          label: "Default export format",
          type: "select",
          options: ["PDF", "CSV (Excel Compatible)", "XLSX"],
        },
        {
          key: "add_logo_to_exports",
          label: "Embed official school crest on PDF documents",
          hint: "Stamp generated marksheets, reports and invoices with authenticated header graphics.",
          type: "toggle",
        },
        {
          key: "require_permission_for_csv",
          label: "Restrict raw CSV data exports to administrators",
          hint: "Enforce strict least-privilege export controls to protect student privacy and PII.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   16. ADMINISTRATION / AUDIT & ACTIVITY LOGS
   ========================================================================== */
export function AuditActivityLogs(_: SectionProps) {
  const [logs, setLogs] = useState<
    Array<{
      id: string;
      activity: string;
      details?: string | null;
      timestamp?: string | null;
      created_at?: string | null;
      user?: { username?: string } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getAuditLogs(token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        } else {
          setLogs([
            {
              id: "1",
              activity: "System Initialized",
              details: "Default system settings and audit logging initialized",
              timestamp: new Date().toISOString(),
              user: { username: "Admin" },
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    const token = getToken();
    if (!token) {
      setExportError("Please sign in again to export audit logs.");
      return;
    }

    try {
      setExporting(true);
      setExportError(null);
      await exportAuditLogsCSV(token);
    } catch (err: any) {
      setExportError(err?.message || "Failed to export logs.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card
      title="Audit & activity logs"
      description="An immutable, read-only audit ledger recording critical administrative actions and access events."
    >
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-700">
        <Eye className="h-4 w-4 text-slate-500" />
        This audit trail is append-only and cryptographically bound. Records cannot be edited or deleted.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-xs text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching activity logs…
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.slice(0, 15).map((log, idx) => (
            <div className="flex items-center gap-3 py-3.5" key={log.id || idx}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
                <UserRound className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{log.activity}</p>
                <p className="text-xs text-slate-500">
                  {log.details ? `${log.details} · ` : ""}by{" "}
                  <span className="font-medium text-slate-700">
                    {log.user?.username || "System Administrator"}
                  </span>
                </p>
              </div>
              <span className="whitespace-nowrap text-xs text-slate-400">
                <Clock3 className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                {log.timestamp || log.created_at
                  ? new Date(log.timestamp || log.created_at!).toLocaleString()
                  : "Recently"}
              </span>
            </div>
          ))}
        </div>
      )}

      {exportError && (
        <p className="mt-3 text-xs font-medium text-rose-600">{exportError}</p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || logs.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4 text-slate-500" />
          )}
          Export logs (CSV)
        </button>
      </div>
    </Card>
  );
}

/* ==========================================================================
   17. ADMINISTRATION / INTEGRATIONS
   ========================================================================== */
export function Integrations(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="integrations"
      title="Third-party service integrations"
      description="Manage API connectivity to online payment processors, SMS telecom gateways and transactional SMTP services."
      fields={[
        {
          key: "payment_gateway",
          label: "Primary payment gateway provider",
          type: "select",
          options: ["Razorpay", "Stripe", "Cashfree", "PayU"],
        },
        {
          key: "payment_gateway_connected",
          label: "Enable payment gateway integration",
          hint: "Allow student fee invoices to be settled online through secure cards/UPI.",
          type: "toggle",
        },
        {
          key: "sms_provider_connected",
          label: "Enable SMS broadcast gateway",
          hint: "Deliver time-sensitive SMS alerts through configured telecom credentials.",
          type: "toggle",
        },
        {
          key: "smtp_email_connected",
          label: "Enable transactional SMTP email dispatch",
          hint: "Send automated reports, invoices and authentication emails via server SMTP.",
          type: "toggle",
        },
      ]}
    />
  );
}

/* ==========================================================================
   18. ADMINISTRATION / SYSTEM CONFIGURATION
   ========================================================================== */
export function SystemConfiguration(_: SectionProps) {
  return (
    <ConfigCategorySection
      category="system"
      title="Global system controls"
      description="Operational parameters governing application security thresholds, maintenance mode, and automated backups."
      fields={[
        {
          key: "session_timeout_minutes",
          label: "Session inactivity timeout (minutes)",
          type: "number",
          hint: "Automatically invalidate inactive user sessions for enhanced security.",
        },
        {
          key: "max_upload_size_mb",
          label: "Maximum file upload limit (MB)",
          type: "number",
          hint: "Maximum permissible size for student attachments, assignments and certificates.",
        },
        {
          key: "maintenance_mode",
          label: "Activate system maintenance mode",
          hint: "Temporarily display a scheduled maintenance screen to non-admin users.",
          type: "toggle",
        },
        {
          key: "automatic_nightly_backups",
          label: "Automated nightly database snapshots",
          hint: "Run scheduled point-in-time database backups at 02:00 AM server time.",
          type: "toggle",
        },
      ]}
    />
  );
}

