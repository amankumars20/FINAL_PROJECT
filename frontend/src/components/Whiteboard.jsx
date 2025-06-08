import { Excalidraw, restore } from "@excalidraw/excalidraw";
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import { useSelector } from "react-redux";

const socket = io("http://18.209.13.39:5000");

const Whiteboard = () => {
    const { roomId } = useParams();
    const [elements, setElements] = useState([]);
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [owner, setOwn] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const { isLoggedIn, user } = useSelector((state) => state.auth);
    const updateScene = useCallback((newElements) => {
        if (!excalidrawAPI) return;
        
        excalidrawAPI.updateScene({ elements: newElements });
    }, [excalidrawAPI]);

    useEffect(() => {
        if (!roomId) return; 

        socket.emit("get-whiteboard", roomId,user?.id ? user?.id : null);

        const updateWhiteboard = (updatedStrokes) => {
            if (!Array.isArray(updatedStrokes)) return;
                
            setElements((prev) => {
                if (JSON.stringify(prev) !== JSON.stringify(updatedStrokes)) {
                    updateScene(updatedStrokes);
                    return updatedStrokes;
                }
                return prev;
            });
        };

        socket.on("update-view-only", (status) => {
            setViewOnly(status.viewOnly);
            setOwn(status.userId)
        });
        socket.on("update-move", (move) => {
           
        });
        
        socket.on("zoom-change", (newZoom) => {
            setZoomLevel(newZoom);
            applyZoom(newZoom);
        });
        
        socket.on("update-whiteboard", updateWhiteboard);

        socket.on("load-whiteboard", (strokes) => {

            if (!Array.isArray(strokes)) {
                console.error("❌ Invalid strokes received:", strokes);
                setElements([]);
                return;
            }
            updateScene(strokes);
            setElements(strokes);
        });

        return () => {
            socket.off("update-whiteboard", updateWhiteboard);
            socket.off("load-whiteboard");
            socket.off("update-view-only");
            socket.off("zoom-change");
        };
    }, [roomId,updateScene,viewOnly]);
    

    const applyZoom = useCallback((zoom) => {
        if (excalidrawAPI) {
            excalidrawAPI.updateScene({
                appState: { zoom: { value: zoom } },
            });
        }
    }, [excalidrawAPI]);

    const handleZoomChange = (newZoom) => {
        setZoomLevel(newZoom);
        socket.emit("zoom-change", roomId, newZoom);
        applyZoom(newZoom);
    };

    const toggleViewOnly = () => {
        socket.emit("toggle-view-only", roomId, user?.id);
    };

    const debouncedEmit = useCallback(
        debounce((newElements) => {
            // if (!viewOnly) {
                socket.emit("draw", roomId, user?.id, newElements);
            // }
        }, 300), // Adjust delay to reduce blinking
        [roomId]
    );

    const handleChange = (newElements) => {
        if (!Array.isArray(newElements)) return;
        setElements(newElements);
        debouncedEmit(newElements);
    };


    return (
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">Real-Time Whiteboard</h1>
            {user?.id == "" || user?.id == owner &&
            <>
            {viewOnly && owner && user?.id !== owner ? null : (
                <button 
                    onClick={toggleViewOnly}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    {viewOnly ? "Disable View-Only" : "Enable View-Only"}
                </button>
            )}
            </>
            }

            <div className="flex gap-2 mb-2 mt-2">

            <button 
                    onClick={() => handleZoomChange(Math.min(zoomLevel + 0.1, 3))}
                    className="bg-green-500 text-white px-2 py-0 rounded-md"
                >
                    Zoom In +
                </button>
                <button 
                    onClick={() => handleZoomChange(Math.max(zoomLevel - 0.1, 0.5))}
                    className="bg-red-500 text-white px-2 py-0 rounded-md"
                >
                    Zoom Out -
                </button>
                </div>
            <div style={{ height: "500px", width: "100%" }}>
                <Excalidraw
                    excalidrawAPI={setExcalidrawAPI}
                    onChange={handleChange}
                      onPointerUp={() => {
                        if (excalidrawAPI) {
                            const zoomLevel = excalidrawAPI.getAppState().zoom.value;
                            setZoomLevel(zoomLevel);
                            handleZoomChange(zoomLevel);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Whiteboard;