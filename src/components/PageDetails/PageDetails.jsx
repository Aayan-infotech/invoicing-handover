import React from "react";

function PageDetails({ title, content }) {
  return (
    <section className="privacy-section py-5">
      <div className="container">
        <h2 className="text-center fw-bold mb-4">{title}</h2>
        <div
          className="privacy-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}

export default PageDetails;
