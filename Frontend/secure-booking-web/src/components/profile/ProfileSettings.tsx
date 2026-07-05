import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import { ChangePasswordRequest, UpdateProfileRequest, User } from "../../types/User";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface ProfileFormErrors {
  fullName?: string;
  phone?: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfileSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileSubmitError, setProfileSubmitError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSubmitError, setPasswordSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          signal: controller.signal,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: User = await response.json();
        setUser(data);
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError("Couldn't load your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, []);

  function validateProfile(): ProfileFormErrors {
    const errors: ProfileFormErrors = {};
    if (!fullName.trim()) errors.fullName = "Name is required.";
    if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) {
      errors.phone = "Enter a valid phone number.";
    }
    return errors;
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileSubmitError(null);

    const errors = validateProfile();
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingProfile(true);

    try {
      const payload: UpdateProfileRequest = {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      setUser((prev) => (prev ? { ...prev, ...payload } : prev));
      setProfileSuccess(true);
    } catch (err) {
      setProfileSubmitError(
        err instanceof Error ? err.message : "Couldn't update your profile. Please try again."
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  function validatePassword(): PasswordFormErrors {
    const errors: PasswordFormErrors = {};

    if (!currentPassword) errors.currentPassword = "Current password is required.";

    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }

    if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordSubmitError(null);

    const errors = validatePassword();
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingPassword(true);

    try {
      const payload: ChangePasswordRequest = { currentPassword, newPassword };

      const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordSubmitError(
        err instanceof Error ? err.message : "Couldn't change your password. Please try again."
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (isLoading) {
    return <p className="p-8 text-sm text-gray-500">Loading your profile…</p>;
  }

  if (loadError || !user) {
    return <p className="p-8 text-sm text-red-600">{loadError ?? "Profile not found."}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and password.
        </p>
      </div>

      {/* Avatar + basic info */}
      <div className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <UserCircle className="h-16 w-16 text-gray-300" />
        )}

        <div>
          <p className="text-lg font-semibold">{user.fullName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleProfileSubmit}
        className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold">Personal information</h2>

        {profileSuccess && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Profile updated successfully.
          </div>
        )}
        {profileSubmitError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {profileSubmitError}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {profileErrors.fullName && (
            <p className="mt-1 text-xs text-red-600">{profileErrors.fullName}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Contact support to change your email address.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {profileErrors.phone && (
            <p className="mt-1 text-xs text-red-600">{profileErrors.phone}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSavingProfile}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSavingProfile ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* Password form */}
      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold">Change password</h2>

        {passwordSuccess && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Password changed successfully.
          </div>
        )}
        {passwordSubmitError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {passwordSubmitError}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {passwordErrors.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {passwordErrors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {passwordErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSavingPassword}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSavingPassword ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}