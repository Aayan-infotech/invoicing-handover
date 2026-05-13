import React from "react";

function VerifyOTP() {
  return (
    <div>
      <h2>Verify OTP</h2>
      <form>
        <div>
          <label htmlFor="otp">Enter OTP:</label>
          <input type="text" id="otp" name="otp" required />
        </div>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}

export default VerifyOTP;
