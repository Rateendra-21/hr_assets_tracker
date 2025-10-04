import { UserCheckIcon } from "lucide-react";
import Assign from "./Assign";
import Header from "../Common/Header"

const Allocation = () => {
  return (
    <main className="flex-grow-1">
      {/* Header */}
      <Header></Header>

      

      {/* Assign component */}
      <div className="px-3 px-md-4 py-4">
        <Assign />
      </div>
    </main>
  );
};

export default Allocation;