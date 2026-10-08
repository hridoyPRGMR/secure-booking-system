import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Circle, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import axios from "axios";
import axiosClient from "../../api/apiClient";
import { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from "../../types/User";

// Pulls the most useful message out of an API error (ProblemDetails / validation errors).
function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { detail?: string; errors?: Record<string, string[]> }
      | undefined;
    const firstValidation = data?.errors && Object.values(data.errors)[0]?.[0];
    return firstValidation || data?.detail || fallback;
  }
  return fallback;
}

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
  const [user, setUser] = useState<UserProfile | null>(null);
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
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const { data } = await axiosClient.get<UserProfile>("/users/me", {
          signal: controller.signal,
        });
        setUser(data);
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
      } catch (err) {
        if (axios.isCancel(err)) return;
        setLoadError("Couldn't load your profile. Please try again.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
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

      const { data } = await axiosClient.put<UserProfile>("/users/me", payload);

      setUser(data);
      setFullName(data.fullName);
      setPhone(data.phone ?? "");
      setProfileSuccess(true);
    } catch (err) {
      setProfileSubmitError(apiErrorMessage(err, "Couldn't update your profile. Please try again."));
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

      await axiosClient.post("/users/me/password", payload);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordSubmitError(apiErrorMessage(err, "Couldn't change your password. Please try again."));
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6" aria-busy="true">
        <div className="skeleton h-8 w-56" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="skeleton h-72 lg:col-span-1" />
          <div className="space-y-6 lg:col-span-2">
            <div className="skeleton h-80" />
            <div className="skeleton h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <div role="alert" className="alert alert-error alert-soft">
          <AlertCircle className="h-5 w-5" />
          <span>{loadError ?? "Profile not found."}</span>
        </div>
      </div>
    );
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName && user.lastName !== "-" ? user.lastName[0] : ""}`.toUpperCase() ||
    user.email[0].toUpperCase();
  const profileDirty =
    fullName.trim() !== user.fullName || phone.trim() !== (user.phone ?? "");

  const rules = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", ok: /[a-z]/.test(newPassword) },
    { label: "One number", ok: /[0-9]/.test(newPassword) },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Profile settings</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Manage your personal information and keep your account secure.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Summary */}
        <aside className="card card-border bg-base-100 lg:sticky lg:top-6">
          <div className="card-body items-center text-center">
            {user.avatarUrl ? (
              <div className="avatar">
                <div className="h-24 w-24 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
                  <img src={user.avatarUrl} alt={user.fullName} referrerPolicy="no-referrer" />
                </div>
              </div>
            ) : (
              <div className="avatar avatar-placeholder">
                <div className="h-24 w-24 rounded-full bg-neutral text-neutral-content">
                  <span className="text-3xl font-semibold">{initials}</span>
                </div>
              </div>
            )}

            <h2 className="mt-2 text-lg font-semibold">{user.fullName}</h2>
            <p className="break-all text-sm text-base-content/60">{user.email}</p>

            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <span className="badge badge-soft badge-success gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Active account
              </span>
              {user.phone && (
                <span className="badge badge-soft gap-1">
                  <Phone className="h-3.5 w-3.5" /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          {/* Profile form */}
          <form onSubmit={handleProfileSubmit} className="card card-border bg-base-100" noValidate>
            <div className="card-body gap-4">
              <div>
                <h2 className="card-title text-lg">Personal information</h2>
                <p className="text-sm text-base-content/60">Update your name and contact details.</p>
              </div>

              {profileSuccess && (
                <div role="alert" className="alert alert-success alert-soft text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Profile updated successfully.</span>
                </div>
              )}
              {profileSubmitError && (
                <div role="alert" className="alert alert-error alert-soft text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>{profileSubmitError}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="fieldset p-0 sm:col-span-2">
                  <legend className="fieldset-legend">Full name</legend>
                  <label className={`input w-full ${profileErrors.fullName ? "input-error" : ""}`}>
                    <User className="h-4 w-4 opacity-50" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      placeholder="Your full name"
                    />
                  </label>
                  {profileErrors.fullName && <p className="label text-error">{profileErrors.fullName}</p>}
                </fieldset>

                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend">Email</legend>
                  <label className="input w-full">
                    <Mail className="h-4 w-4 opacity-50" />
                    <input type="email" value={user.email} disabled />
                  </label>
                  <p className="label">Contact support to change your email.</p>
                </fieldset>

                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend">Phone (optional)</legend>
                  <label className={`input w-full ${profileErrors.phone ? "input-error" : ""}`}>
                    <Phone className="h-4 w-4 opacity-50" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="+1 555 123 4567"
                    />
                  </label>
                  {profileErrors.phone && <p className="label text-error">{profileErrors.phone}</p>}
                </fieldset>
              </div>

              <div className="card-actions justify-end">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={!profileDirty || isSavingProfile}
                  onClick={() => {
                    setFullName(user.fullName);
                    setPhone(user.phone ?? "");
                    setProfileErrors({});
                  }}
                >
                  Reset
                </button>
                <button type="submit" disabled={!profileDirty || isSavingProfile} className="btn btn-primary">
                  {isSavingProfile && <span className="loading loading-spinner loading-sm" />}
                  {isSavingProfile ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </form>

          {/* Password form */}
          <form onSubmit={handlePasswordSubmit} className="card card-border bg-base-100" noValidate>
            <div className="card-body gap-4">
              <div>
                <h2 className="card-title text-lg">Change password</h2>
                <p className="text-sm text-base-content/60">
                  Use a strong password you don't use anywhere else.
                </p>
              </div>

              {passwordSuccess && (
                <div role="alert" className="alert alert-success alert-soft text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Password changed successfully.</span>
                </div>
              )}
              {passwordSubmitError && (
                <div role="alert" className="alert alert-error alert-soft text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>{passwordSubmitError}</span>
                </div>
              )}

              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend">Current password</legend>
                <label className={`input w-full ${passwordErrors.currentPassword ? "input-error" : ""}`}>
                  <Lock className="h-4 w-4 opacity-50" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                {passwordErrors.currentPassword && (
                  <p className="label text-error">{passwordErrors.currentPassword}</p>
                )}
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend">New password</legend>
                  <label className={`input w-full ${passwordErrors.newPassword ? "input-error" : ""}`}>
                    <Lock className="h-4 w-4 opacity-50" />
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </label>
                  {passwordErrors.newPassword && <p className="label text-error">{passwordErrors.newPassword}</p>}
                </fieldset>

                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend">Confirm new password</legend>
                  <label className={`input w-full ${passwordErrors.confirmPassword ? "input-error" : ""}`}>
                    <Lock className="h-4 w-4 opacity-50" />
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </label>
                  {passwordErrors.confirmPassword && (
                    <p className="label text-error">{passwordErrors.confirmPassword}</p>
                  )}
                </fieldset>
              </div>

              {newPassword && (
                <ul className="grid gap-1 text-sm sm:grid-cols-2" aria-label="Password requirements">
                  {rules.map((r) => (
                    <li
                      key={r.label}
                      className={`flex items-center gap-2 ${r.ok ? "text-success" : "text-base-content/50"}`}
                    >
                      {r.ok ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}

              <div className="card-actions items-center justify-between">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-2"
                  onClick={() => setShowPasswords((v) => !v)}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPasswords ? "Hide passwords" : "Show passwords"}
                </button>
                <button type="submit" disabled={isSavingPassword} className="btn btn-primary">
                  {isSavingPassword && <span className="loading loading-spinner loading-sm" />}
                  {isSavingPassword ? "Updating…" : "Update password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
