



import React, { useEffect, useState } from "react";



import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const socket = io(baseUrl);


const Editor = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [ownerId, setOwnerId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false); // Toggle state

    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    useEffect(() => {
        socket.emit("get-document", roomId);
        socket.on("load-document", (data) => setContent(data));
        socket.on("receive-readonly-status", (status) => setIsReadOnly(status));

        return () => {
            socket.off("load-document");
            socket.off("receive-readonly-status");
        };
    }, [roomId]);

    useEffect(() => {
        socket.on("receive-changes", (newContent) => {
            if (!isReadOnly) setContent(newContent);
        });

        return () => {
            socket.off("receive-changes");
        };
    }, [isReadOnly]);

    const handleEditorChange = (value) => {
        if (!isReadOnly || user.id === ownerId) { // Only the owner can write
            setContent(value);
            socket.emit("send-changes", roomId, value, user.id);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/signin");
    };
    socket.on("receive-readonly-status", ({ isReadOnly, ownerId }) => {
        setIsReadOnly(isReadOnly);
        setOwnerId(ownerId);
    });
    // Handle Toggle Change
    const handleToggle = () => {
        if(isLoggedIn){
        const newStatus = !isReadOnly;
        setIsReadOnly(newStatus);
        socket.emit("update-readonly-status", roomId, newStatus);
    }
    };
    

    return (
        <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold text-white">whitecode</h1>
                <div>
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <div className="relative">
                                {/* Share Button to Open Modal */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-1 text-sm bg-gray-700 rounded-md text-white mr-2"
                                >
                                    Share
                                </button>

                                {/* User Dropdown */}
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="px-4 py-1 text-sm bg-gray-700 rounded-md text-white"
                                >
                                    {user.name} ▼
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-10">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="px-4 py-1 text-sm bg-blue-600 rounded-md text-white mr-2"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.setItem("previousPath", window.location.pathname);
                                        navigate("/signin");
                                    }}
                                    className="px-4 py-1 text-sm bg-green-600 rounded-md text-white"
                                >
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-grow">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={content}
                    onChange={handleEditorChange}
                    options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        automaticLayout: true,
                        readOnly: isReadOnly, // Disable editing if read-only is true
                    }}
                />
            </div>

            {/* Share Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-96">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Sharing Settings</h2>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Allow Editing</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={!isReadOnly}
                                    onChange={handleToggle}
                                />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;