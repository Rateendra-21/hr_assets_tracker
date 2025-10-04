import { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Card, Row, Col, Form, Alert } from "react-bootstrap";
import axios from "axios";

const EwasteDisposal = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = JSON.parse(sessionStorage.getItem("userData") || "null");
  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchEwasteAssets();
  }, []);

  const fetchEwasteAssets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/assets/ewaste`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setAssets(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching e-waste assets:", err);
      setError("Failed to load e-waste assets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return <Badge bg="dark">E-Waste</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container className="py-4">
      <h4 className="mb-4">E-Waste Disposal Management</h4>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">E-Waste Assets</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p className="text-center py-3">Loading assets...</p>
          ) : assets.length === 0 ? (
            <p className="text-center py-3">No e-waste assets found.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Serial Number</th>
                  <th>Status</th>
                  <th>Disposal Date</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.asset_name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.serial_number}</td>
                    <td>{getStatusBadge(asset.status)}</td>
                    <td>{formatDate(asset.updated_at)}</td>
                    <td>{asset.remarks || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">E-Waste Disposal Guidelines</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={12}>
              <h6>Proper E-Waste Disposal Process:</h6>
              <ol>
                <li>All e-waste assets must be properly documented before disposal</li>
                <li>Remove all company data and reset devices to factory settings</li>
                <li>Contact approved e-waste recycling vendors for collection</li>
                <li>Obtain disposal certificates for audit purposes</li>
                <li>Update asset records with disposal confirmation</li>
              </ol>
              
              <h6 className="mt-4">Environmental Compliance:</h6>
              <p>
                All e-waste disposal must comply with local environmental regulations.
                For more information, contact the IT department or environmental compliance officer.
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EwasteDisposal;

// NOT IN USE