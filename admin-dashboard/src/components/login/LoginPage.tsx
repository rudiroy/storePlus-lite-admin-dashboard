import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { comingsoon } from "../../assets/login/index";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PORTAL = "admin" as const;
const API_URL = "YOUR_API_BASE_URL/create/admin/email-login";

const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

const getErrorText = (code: string) => {
  if (!code) return "";
  if (code === "NO_ACCESS") return "You have No Access to Admin Web Portal";
  if (code === "InvalidEmail") return "Please enter a valid email address";
  return code;
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const navigate = useNavigate();

  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canSubmit = acceptPolicy && !loading;

  const setError = (msg: string) => setErrorMsg(msg);

  const handleLogin = async () => {
    if (loading) return;

    if (!isValidEmail(trimmedEmail)) {
      setError("InvalidEmail");
      toast.error("Invalid email format.");
      return;
    }

    const domain = trimmedEmail.split("@")[1];
    if (domain !== "pqxel.com") {
      setError("Only Pqxel company emails are allowed.");
      return;
    }

    if (!acceptPolicy) {
      setError("Please accept the policy to continue.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, portal: PORTAL }),
      });

      const body = await res.json();
      const data = body?.data ?? body;

      const msg = String(body?.message ?? "").toLowerCase();
      const isAdmin =
        typeof data?.isAdmin !== "undefined" ? Boolean(data.isAdmin) : undefined;

      if (msg.includes("no access") || msg.includes("not an admin") || isAdmin === false) {
        setError("NO_ACCESS");
        return;
      }

      const userId: string | null = data?.userId ?? body?.userId ?? null;
      if (!userId) throw new Error(body?.message || "Login failed. Please try again.");

      localStorage.setItem("userId", userId);
      localStorage.setItem("email", trimmedEmail);
      localStorage.setItem("portal", PORTAL);

      toast.success("OTP sent successfully!");
      navigate("/otp", { state: { email: trimmedEmail, portal: PORTAL } });
    } catch (err: any) {
      const raw = String(err?.message || "Login failed. Please try again.");
      const lower = raw.toLowerCase();

      if (lower.includes("no access") || lower.includes("not an admin")) setError("NO_ACCESS");
      else if (raw === "User not found") setError("User not found. Please check and try again.");
      else if (raw === "Invalid email format.") setError("InvalidEmail");
      else setError(raw);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && canSubmit) handleLogin();
    if (e.key === "Backspace" && errorMsg) setError("");
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen w-screen font-sans bg-white">
        {/* Left visual */}
        <div className="hidden md:block md:w-1/2 h-full relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${comingsoon})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1666FE] to-black opacity-75" />
        </div>

        {/* Right form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white h-full px-6">
          <div className="w-full max-w-lg bg-[#EAF1FB] p-10 rounded-2xl shadow-md flex flex-col items-center">
            <div className="text-center mb-6 w-full">
              <img src={comingsoon} alt="Pqxel Logo" className="w-auto h-12 mx-auto" />
              <p className="text-2xl font-semibold text-black mt-4 mb-2">Admin Login</p>
            </div>

            <div className="w-full">
              <label htmlFor="email" className="block text-base font-normal text-black mb-2">
                Admin Email Address
              </label>

              <div className="flex items-center border border-[#E0E0E0] rounded-md px-3 py-3 mb-4 bg-white">
                <IoMdPerson className="text-gray-500 text-lg mr-2" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled={loading}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setError("");
                  }}
                  placeholder="Enter your Pqxel Admin Email ID"
                  className="w-full text-base bg-transparent placeholder-gray-400 outline-none"
                />
              </div>

              <div className="flex flex-row items-center gap-2 mb-6">
                <input
                  id="accept-policy"
                  type="checkbox"
                  className="accent-blue-600 w-4 h-4"
                  checked={acceptPolicy}
                  onChange={(e) => setAcceptPolicy(e.target.checked)}
                />
                <label
                  htmlFor="accept-policy"
                  className="text-xs font-normal text-black select-none cursor-pointer"
                >
                  I agree to Store Plus usage policy
                </label>
              </div>

              {!!errorMsg && <div className="text-red-600 text-sm mb-3">{getErrorText(errorMsg)}</div>}

              <button
                onClick={handleLogin}
                disabled={!canSubmit}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-base font-semibold transition-all duration-150 ${
                  !canSubmit ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
};

export default LoginPage;