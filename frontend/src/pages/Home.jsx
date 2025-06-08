import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import editorDemo from "../assets/editor-demo.mp4";
import whiteboardDemo from "../assets/whiteboard-demo.mp4";

const Home = () => {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const joinCode = () => {
    if (room.trim()) {
      const cleanUrl = `/code/${room}`;
      const url = new URL(cleanUrl, window.location.origin);
      url.searchParams.delete("viewOnly");
      navigate(url.pathname + url.search);
    }
  };

  const joinBoard = () => {
    if (room.trim()) {
      navigate(`/board/${room}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 animate-gradient-x opacity-90 z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 p-8 w-full flex flex-col items-center">
        <h1 className="text-4xl sm:text-4xl font-extrabold text-gray-800 drop-shadow-lg mb-6">
          Real-Time Collaborative Editor
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter Note Name"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-md text-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <motion.button
            onClick={joinCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-2 rounded-md text-lg shadow-lg"
          >
            Open Code
          </motion.button>
          <motion.button
            onClick={joinBoard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 hover:bg-green-700 transition-colors text-white px-5 py-2 rounded-md text-lg shadow-lg"
          >
            Open Board
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl px-4">
          {/* Code Editor Video */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 hover:shadow-indigo-300 transition-shadow bg-white"
          >
                    <video
            src={editorDemo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[300px] object-contain bg-black"
          />

            <div className="text-center text-lg font-medium py-2 bg-white border-t">
              Code Editor Demo
            </div>
          </motion.div>

          {/* Whiteboard Video */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 hover:shadow-pink-300 transition-shadow bg-white"
          >
                      <video
              src={whiteboardDemo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[300px] object-contain bg-black"
            />

            <div className="text-center text-lg font-medium py-2 bg-white border-t">
              Whiteboard Demo
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tailwind CSS animation for background */}
      <style>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 10s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
