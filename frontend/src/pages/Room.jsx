import Editor from "../components/Editor";
import Whiteboard from "../components/Whiteboard";
import React, { useState } from 'react';

const Room = () => {
    const { roomId } = useParams();
    const [activeTab, setActiveTab] = useState("text");

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/6 bg-gray-800 text-white p-4 flex flex-col">
                <button 
                    className={`p-2 mb-2 ${activeTab === "text" ? "bg-gray-600" : ""}`}
                    onClick={() => setActiveTab("text")}
                >
                    Text
                </button>
                <button 
                    className={`p-2 ${activeTab === "whiteboard" ? "bg-gray-600" : ""}`}
                    onClick={() => setActiveTab("whiteboard")}
                >
                    Whiteboard
                </button>
            </div>

            {/* Main Content */}
            <div className="w-5/6 p-4">
                {activeTab === "text" ? <Editor roomId={roomId} /> : <Whiteboard roomId={roomId} />}
            </div>
        </div>
    );
};


export default Room;
