import { useState, useEffect } from "react";
import { Download, Plus, User } from "lucide-react";
import EmployeeList from "../employee/Employeelist";
import AddEmployeeModal from "../employee/AddEmployeeModal";
import Header from "../Common/Header"
import toast from "react-hot-toast";


const Employee = () => {
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  // Fetch employees
  const fetchEmployees = async () => {
    
    try {
      setLoading(true);
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const token = userData?.access_token;
      const res = await fetch(`${baseUrl}/employees/getemployee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });

     
      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

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
     
       <Header></Header>
        <div>
          
        </div>
      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-mix shadow-sm">

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
            className="btn btn-outline-light btn-sm d-flex align-items-center"
            onClick={downloadCSVTemplate}
          >
            <Download size={16} className="me-2" />
            Download Template
          </button>

          <button
            className="btn btn-light btn-sm d-flex align-items-center"
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
