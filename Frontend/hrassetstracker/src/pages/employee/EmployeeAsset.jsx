// import { useEffect, useState, useRef } from "react";

// const EmployeeAsset = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const fetchedRef = useRef(false); 

//   useEffect(() => {
//     if (fetchedRef.current) return; 
//     fetchedRef.current = true;

//     const userData = JSON.parse(sessionStorage.getItem("userData"));
//     const employeeId = userData?.employee_id;

//     console.log("Employee ID from sessionStorage:", employeeId);

//     if (!employeeId) {
//       console.error("No employee_id found in sessionStorage");
//       setLoading(false);
//       return;
//     }

//     fetch(`http://127.0.0.1:8000/asset-allocations/assetbyempid/${employeeId}`)
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Failed to fetch");
//         }
//         return res.json();
//       })
//       .then((result) => {
//         setData(result);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching data:", err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <p className="p-3">Loading data...</p>;
//   }

//   return (
//     <main className="flex-grow-1">
//       <div className="d-flex justify-content-between align-items-center p-2  p-md-3 border-bottom">
//         <h4 className="fw-bold" style={{marginBottom:"12px"}}>My Asset</h4>
//       </div>

//       <div className="py-3 px-2 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
//         <div className="row align-items-center mb-3">
//           <div className="col mb-2 mb-md-0">
//             <h5 className="fw-bold mb-1">My Assets</h5>
//             <span className="text-muted">
//               View and manage your allocated company assets
//             </span>
//           </div>
//         </div>
//       </div>

 
//     </main>
//   );
// };

// export default EmployeeAsset;




import { useEffect, useState, useRef } from "react";

const EmployeeAsset = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const employeeId = userData?.employee_id;

    console.log("Employee ID from sessionStorage:", employeeId);

    if (!employeeId) {
      console.error("No employee_id found in sessionStorage");
      setLoading(false);
      return;
    }

    fetch(`http://127.0.0.1:8000/asset-allocations/assetbyempid/${employeeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-3">Loading assets...</p>;
  }

  return (
    <main className="flex-grow-1">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{marginBottom:"12px"}}>My Asset</h4>
      </div>

      {/* Subtitle */}
      <div className="py-3 px-2 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-center mb-3">
          <div className="col mb-2 mb-md-0">
            <h5 className="fw-bold mb-1">My Assets</h5>
            <span className="text-muted">
              View and manage your allocated company assets
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable asset cards */}
      <div
        className="w-100 custom-scroll py-3 px-2 px-md-4"
        style={{ maxWidth: "1100px", maxHeight: "400px", paddingRight: "10px" }}
      >
        {data.length === 0 ? (
          <div
            className="text-center py-5 rounded"
            style={{ border: "1px solid lightgrey" }}
          >
            <span className="text-muted">No assets found</span>
          </div>
        ) : (
          <div className="row g-3">
            {data.map((asset, index) => (
              <div className="col-12 col-sm-6 col-lg-6" key={asset.id || index}>
                <div className="card h-100 shadow-sm border rounded-3">
                  <div className="card-body d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                      <div>
                        <h5 className="card-title mb-1" style={{ fontSize: "1rem" }}>
                          {asset.asset_name || "Untitled Asset"}
                        </h5>
                        <h6 className="card-subtitle text-muted" style={{ fontSize: "0.85rem" }}>
                          {asset.category || "-"} • {asset.model || "-"}
                        </h6>
                      </div>
                      <span
                        className={`badge ${
                          asset.status === "assigned" ? "bg-success" : "bg-danger"
                        } rounded-pill mt-1 mt-md-0`}
                      >
                        {asset.status || "Unknown"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="row mb-3">
                      <div className="col-6 mb-2 mb-md-0">
                        <small className="text-muted">Asset ID</small>
                        <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                          {asset.asset_id}
                        </p>
                      </div>
                      <div className="col-6 mb-2 mb-md-0">
                        <small className="text-muted">Serial Number</small>
                        <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                          {asset.serial_number || "-"}
                        </p>
                      </div>
                      <div className="col-6 mb-2 mb-md-0">
                        <small className="text-muted">Allocated By</small>
                        <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                          {asset.allocated_by || "-"}
                        </p>
                      </div>
                      <div className="col-6 mb-2 mb-md-0">
                        <small className="text-muted">Allocation Date</small>
                        <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                          {asset.allocation_date
                            ? new Date(asset.allocation_date).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Optional buttons */}
                    <div className="mt-auto d-flex gap-2 flex-wrap justify-content-end">
                      {/* You can add buttons like view, edit if needed */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default EmployeeAsset;
