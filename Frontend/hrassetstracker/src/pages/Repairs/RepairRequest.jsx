import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Table, Badge, Modal } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config/api";

const RepairRequest = () => {
  const [assets, setAssets] = useState([]);
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    asset_id: "",
    issue_description: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const user = JSON.parse(sessionStorage.getItem("userData") || "null");
  const isAdmin = user?.is_admin || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user's allocated assets
        const assetsResponse = await axios.get(
          `${API_URL}/assets/allocated-to-employee/${user.employee_id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        
        setAssets(assetsResponse.data);
        
        // Fetch repair requests
        const requestsUrl = isAdmin 
          ? `${API_URL}/repairs/all` 
          : `${API_URL}/repairs/employee/${user.id}`;
          
        const repairsResponse = await axios.get(requestsUrl, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        setRepairRequests(repairsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      await axios.post(
        `${API_URL}/repairs/create`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      setSuccess("Repair request submitted successfully!");
      setFormData({
        asset_id: "",
        issue_description: "",
      });
      
      // Refresh repair requests
      const requestsUrl = isAdmin 
        ? `${API_URL}/repairs/all` 
        : `${API_URL}/repairs/employee/${user.id}`;
        
      const repairsResponse = await axios.get(requestsUrl, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      setRepairRequests(repairsResponse.data);
    } catch (err) {
      console.error("Error submitting repair request:", err);
      setError("Failed to submit repair request. Please try again.");
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/repairs/${requestId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      // Refresh repair requests
      const requestsUrl = isAdmin 
        ? `${API_URL}/repairs/all` 
        : `${API_URL}/repairs/employee/${user.id}`;
        
      const repairsResponse = await axios.get(requestsUrl, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      setRepairRequests(repairsResponse.data);
      setShowModal(false);
      setSuccess("Repair request updated successfully!");
    } catch (err) {
      console.error("Error updating repair request:", err);
      setError("Failed to update repair request. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge bg="warning">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge bg="info">In Progress</Badge>;
      case "COMPLETED":
        return <Badge bg="success">Completed</Badge>;
      case "REJECTED":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Repair Requests</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <Row>
        {!isAdmin && (
          <Col md={4} className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Submit Repair Request</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Asset</Form.Label>
                    <Form.Control
                      as="select"
                      name="asset_id"
                      value={formData.asset_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select an asset</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.asset_name} - {asset.serial_number}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Issue Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="issue_description"
                      value={formData.issue_description}
                      onChange={handleChange}
                      placeholder="Describe the issue with the asset"
                      required
                    />
                  </Form.Group>
                  
                  <Button type="submit" variant="primary" className="w-100">
                    Submit Request
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        <Col md={isAdmin ? 12 : 8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">{isAdmin ? "All Repair Requests" : "My Repair Requests"}</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Loading...</p>
              ) : repairRequests.length === 0 ? (
                <p>No repair requests found.</p>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Asset</th>
                      {isAdmin && <th>Requested By</th>}
                      <th>Issue</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.asset?.asset_name || "N/A"}</td>
                        {isAdmin && <td>{request.employee?.fullname || "N/A"}</td>}
                        <td>{request.issue_description.substring(0, 30)}...</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Repair Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Asset:</strong> {selectedRequest.asset?.asset_name}</p>
                  <p><strong>Serial Number:</strong> {selectedRequest.asset?.serial_number}</p>
                  <p><strong>Requested By:</strong> {selectedRequest.employee?.fullname}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
                  <p><strong>Date Requested:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                  {selectedRequest.updated_at && (
                    <p><strong>Last Updated:</strong> {new Date(selectedRequest.updated_at).toLocaleString()}</p>
                  )}
                </Col>
              </Row>
              
              <div className="mb-3">
                <h6>Issue Description:</h6>
                <p className="border rounded p-3 bg-light">{selectedRequest.issue_description}</p>
              </div>
              
              {selectedRequest.resolution_notes && (
                <div className="mb-3">
                  <h6>Resolution Notes:</h6>
                  <p className="border rounded p-3 bg-light">{selectedRequest.resolution_notes}</p>
                </div>
              )}
              
              {isAdmin && selectedRequest.status !== "COMPLETED" && selectedRequest.status !== "REJECTED" && (
                <div className="mt-4">
                  <h6>Update Status:</h6>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Add resolution notes (optional)"
                      value={selectedRequest.resolution_notes || ""}
                      onChange={(e) => setSelectedRequest({
                        ...selectedRequest,
                        resolution_notes: e.target.value
                      })}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    {selectedRequest.status === "PENDING" && (
                      <Button 
                        variant="info" 
                        onClick={() => handleUpdateStatus(selectedRequest.id, "IN_PROGRESS")}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    <Button 
                      variant="success" 
                      onClick={() => handleUpdateStatus(selectedRequest.id, "COMPLETED")}
                    >
                      Mark Completed
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => handleUpdateStatus(selectedRequest.id, "REJECTED")}
                    >
                      Reject Request
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RepairRequest;