import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { comingsoon } from "../../assets/login/index";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const OTPPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const portal = (
        (location.state as any)?.portal ||
        localStorage.getItem("portal") ||
        "admin"
    ).toLowerCase();

    const [email, setEmail] = useState<string>(
        (location.state as any)?.email || localStorage.getItem("email") || ""
    );

    const [userId, setUserId] = useState<string>(
        localStorage.getItem("userId") || ""
    );

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [verifying, setVerifying] = useState<boolean>(false);
    const [otpError, setOtpError] = useState<string>("");
    const [timer, setTimer] = useState<number>(RESEND_SECONDS);

    // ✅ store actual DOM input elements (NOT refs)
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const state = location.state as any;

        if (state?.email) {
            localStorage.setItem("email", state.email);
            setEmail(state.email);
        }

        if (state?.portal) {
            localStorage.setItem("portal", state.portal);
        }

        const savedUser = localStorage.getItem("userId");
        if (savedUser) setUserId(savedUser);
    }, [location.state]);

    useEffect(() => {
        if (timer <= 0) return;
        const t = setInterval(() => setTimer((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [timer]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const isOtpValid = otp.every((d) => /^\d$/.test(d));

    const focusIndex = (idx: number) => {
        inputsRef.current[idx]?.focus();
        inputsRef.current[idx]?.select();
    };

    const handleBack = () => navigate(-1);

    const handleChange = (val: string, idx: number) => {
        const digit = val.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[idx] = digit || "";
        setOtp(next);

        if (otpError) setOtpError("");
        if (digit && idx < OTP_LENGTH - 1) focusIndex(idx + 1);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        idx: number
    ) => {
        if (e.key === "Enter" && isOtpValid && !verifying) {
            handleSubmit();
            return;
        }

        if (e.key === "Backspace") {
            e.preventDefault();
            const next = [...otp];

            if (next[idx]) {
                next[idx] = "";
                setOtp(next);
            } else if (idx > 0) {
                next[idx - 1] = "";
                setOtp(next);
                focusIndex(idx - 1);
            }

            if (otpError && next.join("") === "") setOtpError("");
        }

        if (e.key === "ArrowLeft" && idx > 0) {
            e.preventDefault();
            focusIndex(idx - 1);
        }

        if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
            e.preventDefault();
            focusIndex(idx + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const pasted = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
        if (!pasted) return;

        e.preventDefault();

        const arr = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
        setOtp(arr);

        if (arr.every((d) => /^\d$/.test(d))) {
            setOtpError("");
            focusIndex(OTP_LENGTH - 1);
        }
    };

    const API_BASE_URL = "YOUR_API_BASE_URL"; // ✅ replace this

    const handleResend = async (): Promise<void> => {
        if (!userId) {
            setOtpError("Missing userId. Please go back and login again.");
            return;
        }

        try {
            const resp = await fetch(
                `${API_BASE_URL}/create/admin/request-email-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, portal }),
                }
            );

            const body = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(body?.message || "Failed to resend OTP.");

            setTimer(RESEND_SECONDS);
            setOtp(Array(OTP_LENGTH).fill(""));
            setOtpError("");
            focusIndex(0);
        } catch (e: any) {
            setOtpError(e?.message || "Failed to resend OTP.");
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!userId) {
            setOtpError("Missing userId. Please go back and login again.");
            return;
        }

        const code = otp.join("");
        if (code.length !== OTP_LENGTH || !isOtpValid) {
            setOtpError("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setVerifying(true);

            const resp = await fetch(
                `${API_BASE_URL}/create/admin/verify-email-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, otp: code, portal }),
                }
            );

            const body = await resp.json().catch(() => ({}));
            const data = body?.data ?? body;

            if (!resp.ok) {
                throw new Error(body?.message || "Invalid OTP. Please try again.");
            }

            const accessToken = data?.accessToken ?? body?.accessToken;
            const refreshToken = data?.refreshToken ?? body?.refreshToken;
            const isAdmin = data?.isAdmin ?? body?.isAdmin;

            if (!accessToken) {
                setOtpError("Invalid OTP, Please Try Again.");
                return;
            }

            if (portal === "admin" && isAdmin === false) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                setOtpError("You have No Access to Admin Web Portal");
                return;
            }

            localStorage.setItem("token", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
            if (typeof isAdmin !== "undefined") {
                localStorage.setItem("isAdmin", String(isAdmin));
            }
            localStorage.setItem("portal", portal);

            navigate("/dashboard/homepage");
        } catch (err: any) {
            const raw = err?.message || "Invalid OTP. Please try again.";
            const l = raw.toLowerCase();

            if (l.includes("invalid otp"))
                setOtpError("Incorrect OTP. Please try again.");
            else if (l.includes("no access") || l.includes("not an admin"))
                setOtpError("You have No Access to Admin Web Portal");
            else if (l.includes("expired"))
                setOtpError("OTP expired. Please resend a new code.");
            else setOtpError(raw);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen bg-white">
            {/* Left visual */}
            <div className="hidden md:block md:w-1/2 h-full relative">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${comingsoon})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1666FE] to-black opacity-75" />
            </div>

            {/* Right form */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 py-6">
                <div className="w-full max-w-md sm:max-w-lg bg-[#EAF1FB] p-6 sm:p-10 rounded-xl shadow-md flex flex-col items-center">
                    <button
                        type="button"
                        className="mb-3 text-sm text-blue-600 flex items-center w-full"
                        onClick={handleBack}
                    >
                        <IoIosArrowBack className="text-xl mr-1 mt-0.5" />
                        <span className="font-bold text-base sm:text-lg">Back</span>
                    </button>

                    <div className="text-center mb-6 w-full">
                        <img
                            src={comingsoon}
                            alt="Pqxel Logo"
                            className="w-auto h-10 mx-auto mb-4"
                        />
                        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">
                            OTP Verification
                        </h2>
                        <p className="text-sm sm:text-base text-black">
                            We&apos;ve sent a 6-digit confirmation code to{" "}
                            <span className="text-blue-600 break-all">{email}</span>. Enter the
                            code below.
                        </p>
                    </div>

                    <div className="w-full max-w-[416px] mx-auto" onPaste={handlePaste}>
                        <div className="flex justify-between mb-4 w-full">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => {
                                        inputsRef.current[i] = el;
                                    }}
                                    id={`otp-${i}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    autoComplete={i === 0 ? "one-time-code" : "off"}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                    onFocus={() => inputsRef.current[i]?.select()}
                                    disabled={verifying}
                                    className="w-[54px] h-[54px] sm:w-[58px] sm:h-[58px] text-center text-2xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    aria-label={`OTP digit ${i + 1}`}
                                />
                            ))}
                        </div>

                        {otpError && (
                            <div className="text-red-600 text-sm text-center mb-3">{otpError}</div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!isOtpValid || verifying || !userId}
                            className={`w-full bg-[#1666FE] hover:bg-blue-700 text-white py-3 rounded-xl text-base font-semibold shadow-md mb-3 transition ${!isOtpValid || verifying || !userId ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {verifying ? "Verifying..." : "Login"}
                        </button>
                    </div>
                    <p className="text-center text-sm sm:text-base text-gray-600 w-full">
                        {timer > 0 ? (
                            <>
                                Resend code in{" "}
                                <span className="font-semibold text-blue-600">
                                    0:{String(timer).padStart(2, "0")}
                                </span>
                            </>
                        ) : (
                            <>
                                Didn’t receive code?{" "}
                                <button
                                    onClick={handleResend}
                                    className="text-blue-600 font-semibold underline-offset-2"
                                >
                                    Resend
                                </button>
                            </>
                        )}
                    </p>

                    {!userId && (
                        <div className="text-center mt-4">
                            <button
                                className="text-xs underline text-gray-600"
                                onClick={() => navigate("/login")}
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OTPPage;