import { useState, useEffect } from "react";
import { Download, Plus } from "lucide-react";
import EmployeeList from "../employee/Employeelist";
import AddEmployeeModal from "../employee/AddEmployeeModal";

const Employee = () => {
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/employees/");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const downloadCSVTemplate = () => {
    const csvHeaders = [
      "fullname",
      "email",
      "employee_id",
      "designation",
      "department_id",
      "location_id",
      "mobile_no",
      "reporting_manager",
    ];
    const csvContent = [csvHeaders.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employee_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex-grow-1">
  
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{marginBottom:"12px"}}>Employee</h4>
      </div>

      <div className="py-3 px-2 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-center mb-3">
          <div className="col mb-2 mb-md-0">
            <h5 className="fw-bold mb-1">Employee Management</h5>
            <span className="text-muted">
              Add and manage employees in your organization
            </span>
          </div>

          <div className="col-auto d-flex gap-2">
            <button
              className="btn btn-white d-flex align-items-center"
              style={{ border: "1px solid black", fontSize: "0.85rem" }} // smaller text
              onClick={downloadCSVTemplate}
            >
              <Download size={16} className="me-1" /> {/* smaller icon too */}
              Download Template
            </button>

            <button
              className="btn btn-dark d-flex align-items-center"
              style={{ fontSize: "0.85rem" }} // smaller text
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} className="me-1" /> {/* smaller icon too */}
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        refreshList={fetchEmployees}
        loading={loading}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSave={fetchEmployees}
      />
    </main>
  );
};

export default Employee;
