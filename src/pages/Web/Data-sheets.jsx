import React from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";

const DataSheets = () => {
  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="d-inline" style={{ minWidth: "240px" }}>
            Data Sheets
          </h2>
         
        </div>

        <div className="mt-4">
          <h4 className="">Lorem Ipsum</h4>
          <div className="d-flex flex-column gap-3 mt-3 data-max">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Jacob</td>
                  <td>Thornton</td>
                  <td>@fat</td>
                </tr>
               
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSheets;
