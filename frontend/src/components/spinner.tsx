import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <div
        className="w-12 h-12 rounded-full border-t-4 border-primary border-r-4 border-r-transparent animate-spin 
                   after:content-[''] after:w-12 after:h-12 after:rounded-full after:border-b-4 after:border-secondary 
                   after:border-l-4 after:border-l-transparent after:absolute after:top-0 after:left-0"
      ></div>
      <div>Loading...</div>
    </div>
  );
};

export default Spinner;
