import { UserCheckIcon } from "lucide-react";
import Assign from "./Assign";
import Header from "../Common/Header"

const Allocation = () => {
  return (
    <main className="flex-grow-1">
      {/* Header */}
      <Header></Header>

      {/* Sub-header */}
      {/* <div className="py-4 px-3 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-start align-items-md-center">
          <div className="col-12 col-md-6">
            <h5 className="fw-bold mb-1">Asset Allocations</h5>
            <span className="text-muted d-block">
              Assign assets to employees and manage allocations
            </span>
          </div>
         
          <div className="col-12 col-md-6 d-flex justify-content-md-end mt-2 mt-md-0">
            <button className="btn btn-dark">
             <UserCheckIcon className="me-2 text-light mb-1 me-1" size={18} /> Assign Asset  
            </button>
          </div>
        </div>
      </div> */}

      {/* Assign component */}
      <div className="px-3 px-md-4 py-4">
        <Assign />
      </div>
    </main>
  );
};

export default Allocation;