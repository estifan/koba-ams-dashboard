"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, KeyRound, Lock, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff, Clock } from "lucide-react";

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    ForgotPassword(email: $email)
  }
`;

const FORGOT_PASSWORD_VERIFY = gql`
  mutation ForgotPasswordVerify($email: String!, $code: String!) {
    ForgotPasswordVerify(email: $email, code: $code)
  }
`;

const FORGOT_PASSWORD_NEW = gql`
  mutation ForgotPasswordNewPassword($email: String!, $newPassword: String!, $code: String!) {
    ForgotPasswordNewPassword(email: $email, newPassword: $newPassword, code: $code)
  }
`;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendTimer, setResendTimer] = useState(0); // seconds remaining for resend
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [sendEmail, { loading: sending }] = useMutation(FORGOT_PASSWORD);
  const [verifyCode, { loading: verifying }] = useMutation(FORGOT_PASSWORD_VERIFY);
  const [setNewPass, { loading: resetting }] = useMutation(FORGOT_PASSWORD_NEW);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    try {
      const { data } = await sendEmail({ variables: { email } });
      if (data?.ForgotPassword) {
        setInfo("Verification code sent to your email.");
        setStep(2);
        setResendTimer(120);
      } else {
        setError("Failed to send verification code.");
      }
    } catch (err) {
      setError(err?.message || "Failed to send verification code.");
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    if (resendTimer > 0) return;
    try {
      const { data } = await sendEmail({ variables: { email } });
      if (data?.ForgotPassword) {
        setInfo("Verification code resent.");
        setResendTimer(120);
      } else {
        setError("Failed to resend verification code.");
      }
    } catch (err) {
      setError(err?.message || "Failed to resend verification code.");
    }
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }
    try {
      const { data } = await verifyCode({ variables: { email, code } });
      if (data?.ForgotPasswordVerify) {
        setInfo("Code verified. You can now set a new password.");
        setStep(3);
      } else {
        setError("Invalid verification code.");
      }
    } catch (err) {
      setError(err?.message || "Verification failed.");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!password || !confirm) {
      setError("Please fill out both password fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!code) {
      setError("Missing verification code. Please verify your code again.");
      return;
    }
    try {
      const { data } = await setNewPass({ variables: { email, newPassword: password, code } });
      if (data?.ForgotPasswordNewPassword) {
        // success -> redirect to login
        router.replace("/loginPage");
      } else {
        setError("Unable to reset password.");
      }
    } catch (err) {
      setError(err?.message || "Unable to reset password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/loginPage" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to login
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{info}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            {step === 1 && (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="text-center mb-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Forgot Password</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a verification code.</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Send Code"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="text-center mb-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Verify Code</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We sent a code to {email}. Enter it below.</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {resendTimer > 0 ? (
                      <span>Resend available in {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}</span>
                    ) : (
                      <span>You can resend a new code.</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || sending}
                    className="text-emerald-600 hover:text-emerald-500 disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-70"
                >
                  {verifying ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="text-center mb-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Set New Password</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a new password for {email}.</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-70"
                >
                  {resetting ? "Saving..." : "Save Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
