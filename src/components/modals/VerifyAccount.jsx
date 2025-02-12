import React, { useState, useEffect } from "react";
import { getSignature, getUserData, sendEmail, sendSms, verifyEmailBack, verifyPhoneBack } from "../../services/Web3Services";

const VerifyAccount = ({ isOpen, setIsOpen, userAddress, phoneSignature, setPhoneSignature, emailSignature, setEmailSignature }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [emailLoadingVerify, setEmailLoadingVerify] = useState(false);
  const [phoneLoadingVerify, setPhoneLoadingVerify] = useState(false);
  const [success, setSuccess] = useState("");
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);

  const handleEmailTimer = () => {
    setEmailTimer(60);
  };

  const handlePhoneTimer = () => {
    setPhoneTimer(60);
  };

  useEffect(() => {
    let interval;
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  useEffect(() => {
    let interval;
    if (phoneTimer > 0) {
      interval = setInterval(() => {
        setPhoneTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer]);

  const sendEmailCode = async () => {
    try {
      setEmailLoading(true);
      setError("");
      setSuccess("");

      await sendEmail(userData.email)

      setSuccess("Verification code sent to your email");
      handleEmailTimer();

    } catch (error) {
      setError(error.message || "Error sending email code");
    } finally {
      setEmailLoading(false);
    }
  };

  const sendPhoneCode = async () => {
    try {
      setPhoneLoading(true);
      setError("");
      setSuccess("");

      const signature = await getSignature(userData.phone);
      setPhoneSignature(signature);
      await sendSms(userData.phone,userData.user_address,signature)

      setSuccess("Verification code sent to your phone");
      handlePhoneTimer();
      
    } catch (error) {
      setError(error.message || "Error sending phone code");
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyEmailCode = async () => {
    try {
      setEmailLoadingVerify(true);
      setError("");

      const signature = await getSignature(userData.email);
      setEmailSignature(signature)
      await verifyEmailBack(userData.email,emailCode.trim(),userData.user_address,signature)

      setSuccess("Email verified successfully");

    } catch (error) {
      console.error(error);
      
      setError(error.response?.data?.error || "Invalid email code");
    } finally {
      setEmailLoadingVerify(false);
    }
  };

  const verifyPhoneCode = async () => {
    try {
      setPhoneLoadingVerify(true);
      setError("");

      await verifyPhoneBack(userData.phone,phoneCode.trim(),userData.user_address,phoneSignature)

      setSuccess("Phone verified successfully");
    } catch (error) {
      setError(error.response?.data?.error || "Invalid phone code");
    } finally {
      setPhoneLoadingVerify(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData(userAddress);
        setUserData(data[0]);
        if(data[0].phone_verified && data[0].email_verified){
          setIsOpen(false)
        }
      } catch (err) {
        console.error(err);
        setError(err);
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, userAddress,emailLoadingVerify,phoneLoadingVerify]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 !mt-0 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#001242]/95 rounded-xl p-6 w-full max-w-lg mx-4 relative max-h-[430px] overflow-y-auto">
        {userData && !userData.email_verified &&
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Verify Email</h2>
            <p className="text-gray-300 mb-4">We sent a code to: {userData.email}</p>
            <input
              type="text"
              placeholder="Enter verification code"
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
              maxLength={6}
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
            />
            <button
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold"
              onClick={() => verifyEmailCode()}
              disabled={emailLoadingVerify}
            >
              {emailLoadingVerify ? "Verifying..." : "Verify Code"}
            </button>
            {emailTimer > 0 ? (
        <button className="w-full p-4 bg-gray-500 rounded-xl text-white">
          Resend Code in {emailTimer}s
        </button>
      ) : (
        <button
          className="w-full p-4 bg-white/5 rounded-xl text-white"
          onClick={sendEmailCode}
          disabled={emailLoading}
        >
          {emailLoading ? "Sending..." : "Send Code"}
        </button>
      )}
          </div>
        }
        {userData && !userData.phone_verified &&
          <div className="space-y-4 mt-4">
            <h2 className="text-2xl font-bold mb-6">Verify Phone</h2>
            <p className="text-gray-300 mb-4">We sent a code to: {userData.phone}</p>
            <input
              type="text"
              placeholder="Enter verification code"
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/50"
              maxLength={6}
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
            />
            <button
              className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold"
              onClick={() => verifyPhoneCode()}
              disabled={phoneLoadingVerify}
            >
              {phoneLoadingVerify ? "Verifying..." : "Verify Code"}
            </button>
            {phoneTimer > 0 ? (
        <button className="w-full p-4 bg-gray-500 rounded-xl text-white">
          Resend Code in {phoneTimer}s
        </button>
      ) : (
        <button
          className="w-full p-4 bg-white/5 rounded-xl text-white"
          onClick={sendPhoneCode}
          disabled={phoneLoading}
        >
          {phoneLoading ? "Sending..." : "Send Code"}
        </button>
      )}
          </div>
        }
        <button
          className="absolute top-4 right-4 text-white bg-red-500 hover:bg-red-700 p-2 rounded"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VerifyAccount;
