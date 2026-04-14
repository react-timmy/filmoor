import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { IconLogoMark } from "../components/Icons";
import avatar1 from "../assets/avatar1.jpg";
import avatar2 from "../assets/avatar2.jpg";
import avatar3 from "../assets/avatar3.jpg";
import avatar4 from "../assets/avatar4.jpg";
import avatar5 from "../assets/avatar5.jpg";

const AVATAR_OPTIONS = [
  { id: "avatar-1", image: avatar1, label: "Avatar 1" },
  { id: "avatar-2", image: avatar2, label: "Avatar 2" },
  { id: "avatar-3", image: avatar3, label: "Avatar 3" },
  { id: "avatar-4", image: avatar4, label: "Avatar 4" },
  { id: "avatar-5", image: avatar5, label: "Avatar 5" },
];

function AvatarDisplay({ avatar, name, size = 80 }) {
  const option =
    AVATAR_OPTIONS.find((opt) => opt.id === avatar) || AVATAR_OPTIONS[0];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid rgba(255,255,255,0.1)",
        flexShrink: 0,
        overflow: "hidden",
        background: "var(--bg2)",
      }}
    >
      <img
        src={option.image}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export default function Profiles() {
  const navigate = useNavigate();
  const { profiles, selectedProfile, selectProfile, createProfile, user } =
    useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "avatar-1",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If no profiles exist and user just registered, show creation form
  useEffect(() => {
    if (profiles.length === 0) {
      setIsCreating(true);
    }
  }, [profiles.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name.trim()) {
      setError("Profile name is required");
      setLoading(false);
      return;
    }

    const result = await createProfile(formData.name, formData.avatar);

    if (result.success) {
      selectProfile(result.profile);
      navigate("/");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleSelectProfile = (profile) => {
    selectProfile(profile);
    navigate("/");
  };

  const handleReset = () => {
    setFormData({
      name: "",
      avatar: "avatar-1",
    });
    setError("");
    setIsCreating(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <IconLogoMark size={40} color="var(--accent)" />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                letterSpacing: 5,
                color: "var(--text)",
                fontWeight: 900,
              }}
            >
              FILM<span style={{ color: "var(--accent)" }}>SORT</span>
            </span>
          </div>
        </div>

        {isCreating ? (
          // Create Profile Form
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 12,
              padding: "32px 24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              {profiles.length === 0
                ? "Create Your First Profile"
                : "Add New Profile"}
            </h2>

            {error && (
              <div
                style={{
                  background: "rgba(232, 55, 44, 0.15)",
                  border: "1px solid rgba(232, 55, 44, 0.3)",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  color: "var(--accent)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* Name Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text2)",
                    marginBottom: 8,
                  }}
                >
                  Profile Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., My Movies"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  Choose Avatar
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: 12,
                  }}
                >
                  {AVATAR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, avatar: option.id })
                      }
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: 12,
                        border:
                          formData.avatar === option.id
                            ? `2px solid var(--accent)`
                            : "2px solid rgba(255,255,255,0.1)",
                        background: "none",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        padding: 0,
                      }}
                    >
                      <img
                        src={option.image}
                        alt={option.label}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "var(--font-body)",
                }}
              >
                {loading ? "Creating..." : "Create Profile"}
              </button>

              {/* Cancel Button (if there are existing profiles) */}
              {profiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    borderRadius: 8,
                    background: "transparent",
                    color: "var(--text2)",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "1px solid var(--border)",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        ) : (
          // Profile Selection
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              Who's watching?
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 20,
                marginBottom: 24,
              }}
            >
              {profiles.map((profile) => (
                <button
                  key={profile._id}
                  onClick={() => handleSelectProfile(profile)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    padding: 0,
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <AvatarDisplay
                    avatar={profile.avatar}
                    name={profile.name}
                    size={100}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text)",
                      textAlign: "center",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCreating(true)}
              style={{
                width: "100%",
                padding: "12px 24px",
                borderRadius: 8,
                background: "transparent",
                color: "var(--accent)",
                fontSize: 14,
                fontWeight: 700,
                border: "2px dashed var(--accent)",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(232, 55, 44, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              + Add Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
