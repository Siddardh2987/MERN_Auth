import React, { useState, useContext } from "react";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const { backendUrl, userData } = useContext(AppContent);
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const verifyEmail = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, { userId: userData?._id, otp }, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Verify Your Email</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={verifyEmail} className="bg-purple-500 text-white px-4 py-2 rounded">
        Verify Email
      </button>
    </div>
  );
};

export default EmailVerify;
