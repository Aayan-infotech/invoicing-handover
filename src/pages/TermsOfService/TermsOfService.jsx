import React from "react";
import Loading from "../../components/Loading/Loading";

function TermsOfService() {
  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <h1>Terms of Service</h1>
      <p>
        Welcome to our service! By using our platform, you agree to the
        following terms:
      </p>
      <h2>Acceptance of Terms</h2>
      <p>
        By accessing or using our service, you agree to be bound by these terms.
      </p>
      <h2>Changes to Terms</h2>
      <p>
        We may modify these terms at any time. Your continued use of the service
        after changes constitutes acceptance of the new terms.
      </p>
      <h2>User Responsibilities</h2>
      <p>
        You are responsible for your account and all activities under your
        account.
      </p>
      <h2>Termination</h2>
      <p>
        We reserve the right to terminate or suspend your access to the service
        at any time, without notice, for conduct that we believe violates these
        terms.
      </p>
      <h2>Contact Us</h2>
      <p>
        If you have any questions about these terms, please contact us at [email
        address].
      </p>
    </div>
  );
}

export default TermsOfService;
