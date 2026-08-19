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
      <div className="card card-border bg-base-100">
        <div className="card-body flex-row items-center gap-4">
          {user.avatarUrl ? (
            <div className="avatar">
              <div className="h-16 w-16 rounded-full">
                <img src={user.avatarUrl} alt={user.fullName} />
              </div>
            </div>
          ) : (
            <UserCircle className="h-16 w-16 text-base-content/30" />
          )}

          <div>
            <p className="text-lg font-semibold">{user.fullName}</p>
            <p className="text-sm text-base-content/60">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfileSubmit} className="card card-border bg-base-100">
        <div className="card-body gap-5">
          <h2 className="card-title text-lg">Personal information</h2>

          {profileSuccess && (
            <div role="alert" className="alert alert-success text-sm">
              Profile updated successfully.
            </div>
          )}
          {profileSubmitError && (
            <div role="alert" className="alert alert-error text-sm">
              {profileSubmitError}
            </div>
          )}

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Full name</legend>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input w-full"
            />
            {profileErrors.fullName && <p className="label text-error">{profileErrors.fullName}</p>}
          </fieldset>

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Email</legend>
            <input type="email" value={user.email} disabled className="input w-full" />
            <p className="label">Contact support to change your email address.</p>
          </fieldset>

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Phone (optional)</legend>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input w-full"
            />
            {profileErrors.phone && <p className="label text-error">{profileErrors.phone}</p>}
          </fieldset>

          <div className="card-actions">
            <button type="submit" disabled={isSavingProfile} className="btn btn-primary">
              {isSavingProfile ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>

      {/* Password form */}
      <form onSubmit={handlePasswordSubmit} className="card card-border bg-base-100">
        <div className="card-body gap-5">
          <h2 className="card-title text-lg">Change password</h2>

          {passwordSuccess && (
            <div role="alert" className="alert alert-success text-sm">
              Password changed successfully.
            </div>
          )}
          {passwordSubmitError && (
            <div role="alert" className="alert alert-error text-sm">
              {passwordSubmitError}
            </div>
          )}

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Current password</legend>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input w-full"
            />
            {passwordErrors.currentPassword && (
              <p className="label text-error">{passwordErrors.currentPassword}</p>
            )}
          </fieldset>

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">New password</legend>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input w-full"
            />
            {passwordErrors.newPassword && <p className="label text-error">{passwordErrors.newPassword}</p>}
          </fieldset>

          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Confirm new password</legend>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input w-full"
            />
            {passwordErrors.confirmPassword && (
              <p className="label text-error">{passwordErrors.confirmPassword}</p>
            )}
          </fieldset>

          <div className="card-actions">
            <button type="submit" disabled={isSavingPassword} className="btn btn-primary">
              {isSavingPassword ? "Updating…" : "Update password"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}