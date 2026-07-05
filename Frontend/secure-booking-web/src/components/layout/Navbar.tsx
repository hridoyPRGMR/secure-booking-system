import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, UserCircle, LogOut, Settings } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms" },
  { to: "/bookings", label: "My Bookings" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md transition ${
      isActive
        ? "bg-indigo-100 text-indigo-600 font-medium"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function handleLogout() {
    // TODO: wire up to real auth (clear token/cookie, call /api/auth/logout, etc.)
    setProfileOpen(false);
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          BookRoom
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Profile */}
        <div className="hidden items-center md:flex" ref={profileRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <UserCircle size={34} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white py-1 shadow-lg">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} />
                  Profile settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="space-y-1 border-t bg-white px-4 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}

          <NavLink to="/profile" className={navClass}>
            Profile
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-red-600 hover:bg-gray-100"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}