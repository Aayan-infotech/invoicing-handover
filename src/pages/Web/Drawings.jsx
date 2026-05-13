import React from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";

const Drawings = () => {
  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="d-inline" style={{ minWidth: "240px" }}>
            Drawings
          </h2>
         
        </div>

        <div className="mt-4">
          <h4 className="">Lorem Ipsum</h4>
          <div className="d-flex flex-row gap-3 mt-3">
            <div className="d-flex flex-column gap-4">
              <div
                className=""
                style={{ height: "300px", width: "200px" }}
              ></div>
              <p>
                Curabitur tempor quis eros tempus lacinia. Nam bibendum
                pellentesque quam a convallis. Sed ut vulputate nisi. Integer in
                felis sed leo vestibulum venenatis. Suspendisse quis arcu sem.
                Aenean feug{" "}
              </p>
            </div>
            <div className="d-flex flex-column gap-4">
              <div
                className=""
                style={{ height: "300px", width: "200px" }}
              ></div>
              <p>
                Curabitur tempor quis eros tempus lacinia. Nam bibendum
                pellentesque quam a convallis. Sed ut vulputate nisi. Integer in
                felis sed leo vestibulum venenatis. Suspendisse quis arcu sem.
                Aenean feug{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawings;
