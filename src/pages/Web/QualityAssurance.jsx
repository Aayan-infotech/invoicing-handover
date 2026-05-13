import React, { useEffect } from "react";
import Form from "react-bootstrap/Form";
import { images } from "../../contstants";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import axiosInstance from "../../components/axiosInstance";
import Loading from "../../components/Loading/Loading";

const QualityAssuranceWeb = () => {
  const navigate = useNavigate();
  const { snackbar } = useOutletContext();
  const [data, setData] = React.useState([]);
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const location = useLocation();
  const { name } = location.state || {};

  const getData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`projects/get-documents/${id}`);
      if (response) {
        setData(response.data.data);
        snackbar.success(response?.data?.message);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message ||
          "Error fetching quality assurance data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  // Check if document type exists in the data
  const hasDocumentType = (documentTypeName) => {
    return data?.some(
      (item) =>
        item?.documentTypeId && item?.documentTypeId?.name === documentTypeName
    );
  };

  // Get document data by type
  const getDocumentByType = (documentTypeName) => {
    return data.find(
      (item) =>
        item.documentTypeId && item.documentTypeId.name === documentTypeName
    );
  };

  // Open PDF in new tab
  const openPdfInNewTab = (documentTypeName) => {
    const documentData = getDocumentByType(documentTypeName);
    if (documentData && documentData.documentFile) {
      window.open(documentData.documentFile, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="d-inline" style={{ minWidth: "240px" }}>
            {name || "Quality Assurance"}
          </h2>

        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="mt-4">
              <h4 className="">Uploaded documents</h4>
              <div className="d-flex flex-column gap-3 mt-3">
                {/* RAMS */}
                <div
                  className={`p-2 ${
                    hasDocumentType("RAMS") ? "bg-lightblue" : "bg-lightgray"
                  }`}
                  style={{
                    cursor: hasDocumentType("RAMS") ? "pointer" : "not-allowed",
                    opacity: hasDocumentType("RAMS") ? 1 : 0.6,
                  }}
                  onClick={() =>
                    hasDocumentType("RAMS") && openPdfInNewTab("RAMS")
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <p
                      className={`fs-4 mb-0 ${
                        hasDocumentType("RAMS")
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      RAMS
                    </p>
                    <button
                      className={`btn rounded-4 ${
                        hasDocumentType("RAMS")
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                      disabled={!hasDocumentType("RAMS")}
                    >
                      <i className="bi bi-arrow-right fs-3"></i>
                    </button>
                  </div>
                </div>

                {/* Data Sheets */}
                <div
                  className={`p-2 ${
                    hasDocumentType("Data Sheets")
                      ? "bg-lightblue"
                      : "bg-lightgray"
                  }`}
                  style={{
                    cursor: hasDocumentType("Data Sheets")
                      ? "pointer"
                      : "not-allowed",
                    opacity: hasDocumentType("Data Sheets") ? 1 : 0.6,
                  }}
                  onClick={() =>
                    hasDocumentType("Data Sheets") &&
                    openPdfInNewTab("Data Sheets")
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <p
                      className={`fs-4 mb-0 ${
                        hasDocumentType("Data Sheets")
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      Data Sheets
                    </p>
                    <button
                      className={`btn rounded-4 ${
                        hasDocumentType("Data Sheets")
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                      disabled={!hasDocumentType("Data Sheets")}
                    >
                      <i className="bi bi-arrow-right fs-3"></i>
                    </button>
                  </div>
                </div>

                {/* Drawings */}
                <div
                  className={`p-2 ${
                    hasDocumentType("Drawings")
                      ? "bg-lightblue"
                      : "bg-lightgray"
                  }`}
                  style={{
                    cursor: hasDocumentType("Drawings")
                      ? "pointer"
                      : "not-allowed",
                    opacity: hasDocumentType("Drawings") ? 1 : 0.6,
                  }}
                  onClick={() =>
                    hasDocumentType("Drawings") && openPdfInNewTab("Drawings")
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <p
                      className={`fs-4 mb-0 ${
                        hasDocumentType("Drawings")
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      Drawings
                    </p>
                    <button
                      className={`btn rounded-4 ${
                        hasDocumentType("Drawings")
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                      disabled={!hasDocumentType("Drawings")}
                    >
                      <i className="bi bi-arrow-right fs-3"></i>
                    </button>
                  </div>
                </div>

                {/* Tool Box Talks */}
                <div
                  className={`p-2 ${
                    hasDocumentType("Tool Box Talks")
                      ? "bg-lightblue"
                      : "bg-lightgray"
                  }`}
                  style={{
                    cursor: hasDocumentType("Tool Box Talks")
                      ? "pointer"
                      : "not-allowed",
                    opacity: hasDocumentType("Tool Box Talks") ? 1 : 0.6,
                  }}
                  onClick={() =>
                    hasDocumentType("Tool Box Talks") &&
                    openPdfInNewTab("Tool Box Talks")
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <p
                      className={`fs-4 mb-0 ${
                        hasDocumentType("Tool Box Talks")
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      Tool Box Talks
                    </p>
                    <button
                      className={`btn rounded-4 ${
                        hasDocumentType("Tool Box Talks")
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                      disabled={!hasDocumentType("Tool Box Talks")}
                    >
                      <i className="bi bi-arrow-right fs-3"></i>
                    </button>
                  </div>
                </div>

                {/* ITPs */}
                <div
                  className={`p-2 ${
                    hasDocumentType("ITPs") ? "bg-lightblue" : "bg-lightgray"
                  }`}
                  style={{
                    cursor: hasDocumentType("ITPs") ? "pointer" : "not-allowed",
                    opacity: hasDocumentType("ITPs") ? 1 : 0.6,
                  }}
                  onClick={() =>
                    hasDocumentType("ITPs") && openPdfInNewTab("ITPs")
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <p
                      className={`fs-4 mb-0 ${
                        hasDocumentType("ITPs")
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      ITPs
                    </p>
                    <button
                      className={`btn rounded-4 ${
                        hasDocumentType("ITPs")
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                      disabled={!hasDocumentType("ITPs")}
                    >
                      <i className="bi bi-arrow-right fs-3"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QualityAssuranceWeb;
