import React, { useEffect, useState } from "react";

const AssetDashboard = () => {
  const [counts, setCounts] = useState({
    total_count: 0,
    category_counts: {},
    status_counts: {},
    location_counts: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/assets/counts");
        const data = await res.json();
        setCounts(data);
      } catch (err) {
        console.error("Failed to fetch asset counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="text-muted">Loading dashboard...</span>
      </div>
    );
  }

  const renderCard = (title, data, bgClass = "bg-dark") => (
    <div className="col-md-3 mb-3">
      <div className={`card shadow-sm ${bgClass} text-light h-100`}>
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          {typeof data === "number" ? (
            <p className="display-6">{data}</p>
          ) : (
            <ul className="list-group list-group-flush">
              {Object.entries(data).map(([key, value]) => (
                <li
                  key={key}
                  className="list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-0 px-0 py-1"
                >
                  <small>{key}</small>
                  <span className="badge bg-secondary rounded-pill">
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container p-4">
      <div
        className="px-4 py-3"
        style={{ border: "1px solid lightgrey", borderRadius: "10px" }}
      >
        <h4 className="mb-4 text-dark">Asset Dashboard</h4>
        <div className="row">
          {renderCard("Total Assets", counts.total_count, "bg-warning")}
          {renderCard("Category Wise", counts.category_counts, "bg-primary")}
          {renderCard("Status Wise", counts.status_counts, "bg-success")}
          {renderCard("Location Wise", counts.location_counts, "bg-warning")}
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;



// import React, { useEffect, useState } from "react";

// const AssetDashboard = () => {
//   const [counts, setCounts] = useState({
//     total_count: 0,
//     category_counts: {},
//     status_counts: {},
//     location_counts: {},
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCounts = async () => {
//       try {
//         const res = await fetch("http://127.0.0.1:8000/assets/counts");
//         const data = await res.json();
//         setCounts(data);
//       } catch (err) {
//         console.error("Failed to fetch asset counts:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCounts();
//   }, []);

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <span className="text-muted">Loading dashboard...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="container my-4 px-4 custom-scroll" style={{ maxWidth: "1100px", maxHeight: "330px", paddingRight: "10px" }}>
//       <h4 className="mb-4 text-dark px-3">Assets</h4>

//       {/* ===== Top Statistic Cards ===== */}
//       <div className="row g-3 mb-2 px-2">
  
//         <div className="col-md-3">
//           <div className="card shadow-sm text-center p-3">
//             <h6 className="text-muted">Total Assets</h6>
//             <h3 className="fw-bold text-primary">{counts.total_count}</h3>
            
//           </div>
//         </div>

//         <div className="col-md-3">
//           <div className="card shadow-sm text-center p-3">
//             <h6 className="text-muted">Allocated Assets</h6>
//             <h3 className="fw-bold text-primary">{counts.allocatedAssets | "0"}</h3>
//           </div>
//         </div>

//         <div className="col-md-3">
//           <div className="card shadow-sm text-center p-3">
//             <h6 className="text-muted">e-waste</h6>
//             <h3 className="fw-bold text-primary">{counts.allocatedAssets | "0"}</h3>
//           </div>
//         </div>

//         <div className="col-md-3">
//           <div className="card shadow-sm text-center p-3">
//             <h6 className="text-muted">Free to Distribute</h6>
//             <h3 className="fw-bold text-primary">{counts.allocatedAssets | "0"}</h3>
//           </div>
//         </div>

       
//       </div>

//       {/* ===== Category Wise Assets ===== */}
//       <div className="row g-3 px-2">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3">
//             <h6 className="mb-3">Category Wise</h6>
//             <ul className="list-group list-group-flush">
//               {Object.entries(counts.category_counts).map(([key, value]) => (
//                 <li
//                   key={key}
//                   className="list-group-item d-flex justify-content-between align-items-center"
//                 >
//                   <span>{key}</span>
//                   <span className="badge bg-primary rounded-pill">{value}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <div className="col-md-4">
//           <div className="card shadow-sm p-3">
//             <h6 className="mb-3">Status Wise</h6>
//             <ul className="list-group list-group-flush">
//               {Object.entries(counts.status_counts).map(([key, value]) => (
//                 <li
//                   key={key}
//                   className="list-group-item d-flex justify-content-between align-items-center"
//                 >
//                   <span>{key}</span>
//                   <span className="badge bg-success rounded-pill">{value}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <div className="col-md-4">
//           <div className="card shadow-sm p-3">
//             <h6 className="mb-3">Location Wise</h6>
//             <ul className="list-group list-group-flush">
//               {Object.entries(counts.location_counts).map(([key, value]) => (
//                 <li
//                   key={key}
//                   className="list-group-item d-flex justify-content-between align-items-center"
//                 >
//                   <span>{key}</span>
//                   <span className="badge bg-warning rounded-pill">{value}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssetDashboard;
