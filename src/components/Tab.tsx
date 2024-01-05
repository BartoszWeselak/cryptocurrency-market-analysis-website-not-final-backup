import React, { useState } from "react";

const Tab = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`mr-2 rounded px-4 py-2 ${
              activeTab === index
                ? "bg-gradient-to-r from-blue-500 text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div>{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tab;
