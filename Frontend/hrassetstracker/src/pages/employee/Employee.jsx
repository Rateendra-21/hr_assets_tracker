import { useState, useEffect } from "react";
import { Download, Plus, User } from "lucide-react";
import EmployeeList from "../employee/Employeelist";
import AddEmployeeModal from "../employee/AddEmployeeModal";
import Header from "../Common/Header"

const Employee = () => {
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/employees/getemployee");
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
      "employee_type",
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
      {/* <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Employee
        </h4>
      </div> */}
       <Header></Header>

      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-light shadow-sm">

        <div className="d-flex flex-column mb-2 mb-md-0">
          <h5 className="text-dark fw-bold mb-1">
            <User size={17} className="me-2" />
            Employee Management
          </h5>
          <small className="text-muted">
            Add and manage employees in your organization
          </small>
        </div>


        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-dark btn-sm d-flex align-items-center"
            onClick={downloadCSVTemplate}
          >
            <Download size={16} className="me-2" />
            Download Template
          </button>

          <button
            className="btn btn-dark btn-sm d-flex align-items-center"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} className="me-2" />
            Add Employee
          </button>
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
