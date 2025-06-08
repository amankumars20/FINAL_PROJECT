



import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ShareModal from "./shareModal";
import { io } from "socket.io-client";
import Settings from "../../public/images/settings.png";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

const languageMap = {
  Java: "java",
  HTML: "html",
  CSS: "css",
  "C#": "csharp",
  JavaScript: "javascript",
};
const socket = io("http://localhost:5000");

const CodeEditor = () => {
  const [openModal, setopenModal] = useState(false);
  const { roomId } = useParams();
  const navigate = useNavigate();
    const [content, setContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const location = useLocation();
  const [isViewOnly, setIsViewOnly] = useState(false);
  const token = localStorage.getItem("token");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("Select an option");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);  
  const [IsUser, setIsUser] = useState(false);  
  const [ownerId, setOwnerId] = useState(null);
  const dispatch = useDispatch();
  const dropdownOptions = ["Java", "HTML", "CSS", "C#", "JavaScript"];
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  // Content persistence
  useEffect(() => {
    socket.emit("get-document", roomId);
    socket.on("load-document", (data) => setContent(data));
    socket.on("receive-readonly-status", (status) => {      
      setIsReadOnly(status?.isReadOnly)
      if(status?.ownerId === user?.id){
        setIsUser(true)
      }
      setOwnerId(status?.ownerId)
    });
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


  const handleSelect = (option) => {
    setSelectedValue(option);
    setSelectedLanguage(languageMap[option]);
    setIsDropdownOpen(false);
  };

  const handleDownload = () => {
    const extensionMap = {
      Java: "java",
      HTML: "html",
      CSS: "css",
      "C#": "cs",
      JavaScript: "js",
    };
    const filename = `${roomId || "code"}.${
      extensionMap[selectedValue] || "txt"
    }`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleEditorChange = (value) => {    
    if (!isReadOnly) { // Only the owner can write
        setContent(value);
        socket.emit("send-changes", roomId, value, user.id);
    }
  };

  const Logout = () => {
        dispatch(logout());
        navigate("/signin");
  };

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">whitecode</h1>
        <div className="flex justify-between items-center">
          <button
            onMouseEnter={() => setIsPopupOpen(true)}
            onMouseLeave={() => setIsPopupOpen(false)}
            className="m-4 cursor-pointer"
          >
            <img src={Settings} alt="settings" className="w-6 h-6" />
          </button>

          {isPopupOpen && (
            <div
              onMouseEnter={() => setIsPopupOpen(true)}
              onMouseLeave={() => setIsPopupOpen(false)}
              className="absolute top-14 right-48 w-64 h-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 z-20"
            >
              <h4 className="text-gray-800 dark:text-white mb-2">
                Editor Settings
              </h4>
              <div className="relative gap-10">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg shadow-md"
                >
                  {selectedValue}
                </button>
                {isDropdownOpen && (
                  <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md z-10">
                    {dropdownOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(option)}
                        className="block w-full px-4 py-2 text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleDownload}
                className="w-full p-2 mt-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg shadow-md"
              >
                Download
              </button>
            </div>
          )}


            <button
            onClick={() => navigate(`/board/${roomId}`)}
            className="px-4 py-1 text-sm cursor-pointer bg-purple-700 rounded-md text-white mr-2"
          >
            Whiteboard
          </button>

          <button
            onClick={() => setopenModal(!openModal)}
            className="px-4 py-1 text-sm cursor-pointer bg-gray-700 rounded-md text-white mr-2"
          >
            Share
          </button>

          {token ? (
            <button
              onClick={Logout}
              className="px-4 py-1 text-sm cursor-pointer bg-gray-700 rounded-md text-white mr-2"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  localStorage.removeItem("previousPath");
                  navigate("/signup");
                }}
                className="px-4 py-1 text-sm bg-blue-600 cursor-pointer rounded-md text-white mr-2"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  navigate("/signin");
                }}
                className="px-4 py-1 cursor-pointer text-sm bg-green-600 rounded-md text-white"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow">
        <Editor
          height="100%"
          language={selectedLanguage}
          theme="vs-dark"
          value={content}
          onChange={handleEditorChange}
          options={{
            readOnly: isReadOnly && !IsUser, 
            minimap: { enabled: false },
            lineNumbers: "on",
            automaticLayout: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoClosingTags: "always",
          }}
        />
      </div>

      <ShareModal
        ownerId={ownerId}
        roomId={roomId}
        openModal={openModal}
        setopenModal={setopenModal}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
        token={token}
      />
    </div>
  );
};

export default CodeEditor;
