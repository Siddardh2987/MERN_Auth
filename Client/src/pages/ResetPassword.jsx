import React, { useState, useContext } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = reset password

  const sendResetOtp = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        setStep(2);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const resetPassword = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { email, otp, newPassword }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {step === 1 ? (
        <>
          <h2 className="text-xl font-semibold">Reset Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={sendResetOtp} className="bg-blue-500 text-white px-4 py-2 rounded">
            Send OTP
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold">Enter OTP & New Password</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={resetPassword} className="bg-green-500 text-white px-4 py-2 rounded">
            Reset Password
          </button>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
