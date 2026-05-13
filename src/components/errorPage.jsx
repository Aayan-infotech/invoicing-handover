import React from "react";
import { useNavigate } from "react-router-dom";
export default function ErrorPage() {
  const styles = {
    body: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(45deg, #000428, #004e92, #000428)",
      backgroundSize: "600% 600%",
      animation: "bg 10s ease infinite",
      margin: 0,
      padding: 0,
      fontFamily: "Arial, sans-serif",
    },
    content: {
      width: "100%",
      maxWidth: "600px",
      textAlign: "center",
      color: "#fafafa",
      border: "2px solid #fafafa",
      borderRadius: "8px",
      padding: "20px",
    },
    h1: {
      fontSize: "150px",
      margin: "0",
    },
    h2: {
      fontSize: "24px",
      margin: "0",
    },
    p: {
      margin: "16px 0",
    },
    button: {
      padding: "0.5em 1em",
      color: "#fafafa",
      border: "2px solid #fafafa",
      borderRadius: "8px",
      background: "none",
      outline: "none",
      transition: "0.3s ease",
      cursor: "pointer",
      margin: "5px",
    },
    fill: {
      backgroundColor: "#fafafa",
      color: "#000428",
    },
    btns: {
      display: "flex",
      justifyContent: "center",
    },
  };

  const keyframes = `
    @keyframes bg {
      0%, 100% {
        background-position: 0% 97%;
      }
      50% {
        background-position: 100% 4%;
      }
    }
  `;

  const navigate = useNavigate()
  const GoBack = () => navigate(-1);
  return (
    <div style={styles.body}>
      <style>{keyframes}</style>
      <div style={styles.content}>
        <h1 style={styles.h1}>404</h1>
        <h2 style={styles.h2}>Oops, Page not found!</h2>
        <p style={styles.p}>
          The Page, that you're looking for is not found (it maybe moved,
          deleted or even doesn't exist). Sorry for the Inconvenience.
        </p>
      
        <div style={styles.btns}>
          <button style={{ ...styles.button, ...styles.fill }} onClick={GoBack}>Go back</button>
        </div>
      </div>
    </div>
  );
}
