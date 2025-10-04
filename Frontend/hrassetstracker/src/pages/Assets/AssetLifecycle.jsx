import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config/api";

const AssetLifecycle = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [lifecycleEvents, setLifecycleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEwasteModal, setShowEwasteModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const user = JSON.parse(sessionStorage.getItem("userData") || "null");
  const isAdmin = user?.is_admin || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/assets`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAssets(response.data);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("Failed to load assets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [user]);

  const fetchAssetLifecycle = async (assetId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/asset-lifecycle/${assetId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLifecycleEvents(response.data);
    } catch (err) {
      console.error("Error fetching asset lifecycle:", err);
      setError("Failed to load asset lifecycle data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelect = async (asset) => {
    setSelectedAsset(asset);
    await fetchAssetLifecycle(asset.id);
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      await axios.post(
        `${API_URL}/asset-lifecycle/update-status`,
        {
          asset_id: selectedAsset.id,
          new_status: newStatus,
          notes: notes
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      // Refresh asset data
      const assetResponse = await axios.get(`${API_URL}/assets/${selectedAsset.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      // Update the selected asset with new data
      setSelectedAsset(assetResponse.data);
      
      // Refresh lifecycle events
      await fetchAssetLifecycle(selectedAsset.id);
      
      setShowStatusModal(false);
      setNewStatus("");
      setNotes("");
      setSuccess("Asset status updated successfully!");
    } catch (err) {
      console.error("Error updating asset status:", err);
      setError("Failed to update asset status. Please try again.");
    }
  };

  const handleEwasteSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      await axios.post(
        `${API_URL}/asset-lifecycle/mark-ewaste`,
        {
          asset_id: selectedAsset.id,
          disposal_reason: notes
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      // Refresh asset data
      const assetResponse = await axios.get(`${API_URL}/assets/${selectedAsset.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      // Update the selected asset with new data
      setSelectedAsset(assetResponse.data);
      
      // Refresh lifecycle events
      await fetchAssetLifecycle(selectedAsset.id);
      
      setShowEwasteModal(false);
      setNotes("");
      setSuccess("Asset marked as e-waste successfully!");
    } catch (err) {
      console.error("Error marking asset as e-waste:", err);
      setError("Failed to mark asset as e-waste. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge bg="success">Available</Badge>;
      case "ALLOCATED":
        return <Badge bg="primary">Allocated</Badge>;
      case "IN_REPAIR":
        return <Badge bg="warning">In Repair</Badge>;
      case "DAMAGED":
        return <Badge bg="danger">Damaged</Badge>;
      case "EWASTE":
        return <Badge bg="dark">E-Waste</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Asset Lifecycle Management</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Assets</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: "600px", overflowY: "auto" }}>
              {loading && !assets.length ? (
                <p>Loading assets...</p>
              ) : assets.length === 0 ? (
                <p>No assets found.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Asset Name</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr 
                        key={asset.id} 
                        className={selectedAsset?.id === asset.id ? "table-active" : ""}
                      >
                        <td>{asset.asset_name}</td>
                        <td>{getStatusBadge(asset.status)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleAssetSelect(asset)}
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
        
        <Col md={8}>
          {selectedAsset ? (
            <>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Asset Details</h5>
                  {isAdmin && (
                    <div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => setShowStatusModal(true)}
                        disabled={selectedAsset.status === "EWASTE"}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="dark"
                        size="sm"
                        onClick={() => setShowEwasteModal(true)}
                        disabled={selectedAsset.status === "EWASTE"}
                      >
                        Mark as E-Waste
                      </Button>
                    </div>
                  )}
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Asset Name:</strong> {selectedAsset.asset_name}</p>
                      <p><strong>Serial Number:</strong> {selectedAsset.serial_number}</p>
                      <p><strong>Category:</strong> {selectedAsset.category}</p>
                      <p><strong>Manufacturer:</strong> {selectedAsset.manufacturer}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Current Status:</strong> {getStatusBadge(selectedAsset.status)}</p>
                      <p><strong>Purchase Date:</strong> {selectedAsset.purchase_date ? new Date(selectedAsset.purchase_date).toLocaleDateString() : "N/A"}</p>
                      <p><strong>Purchase Cost:</strong> {selectedAsset.purchase_cost ? `$${selectedAsset.purchase_cost}` : "N/A"}</p>
                      <p><strong>Warranty Expiry:</strong> {selectedAsset.warranty_expiry ? new Date(selectedAsset.warranty_expiry).toLocaleDateString() : "N/A"}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Lifecycle History</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <p>Loading lifecycle data...</p>
                  ) : lifecycleEvents.length === 0 ? (
                    <p>No lifecycle events found for this asset.</p>
                  ) : (
                    <Table responsive striped>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status Change</th>
                          <th>Changed By</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lifecycleEvents.map((event) => (
                          <tr key={event.id}>
                            <td>{new Date(event.created_at).toLocaleString()}</td>
                            <td>{getStatusBadge(event.status)}</td>
                            <td>{event.changed_by?.fullname || "System"}</td>
                            <td>{event.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </>
          ) : (
            <div className="text-center p-5 bg-light rounded">
              <h4>Select an asset to view its lifecycle details</h4>
            </div>
          )}
        </Col>
      </Row>
      
      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Asset Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleStatusChange}>
            <Form.Group className="mb-3">
              <Form.Label>Current Status</Form.Label>
              <Form.Control
                type="text"
                value={selectedAsset?.status || ""}
                disabled
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Control
                as="select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                <option value="">Select new status</option>
                <option value="AVAILABLE">Available</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="IN_REPAIR">In Repair</option>
                <option value="DAMAGED">Damaged</option>
              </Form.Control>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this status change"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Status
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* E-Waste Modal */}
      <Modal show={showEwasteModal} onHide={() => setShowEwasteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mark Asset as E-Waste</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            <strong>Warning:</strong> This action cannot be undone. The asset will be permanently marked as e-waste.
          </p>
          
          <Form onSubmit={handleEwasteSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Disposal Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide reason for e-waste disposal"
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEwasteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Confirm E-Waste Disposal
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AssetLifecycle;

// #NOT IN USE