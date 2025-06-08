import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

const Whiteboard = () => {
    const { roomId } = useParams();
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState([]);

    useEffect(() => {
        if (!roomId) return;

        socket.emit("get-whiteboard", roomId);

        socket.on("load-whiteboard", (strokes) => {
            if (Array.isArray(strokes)) {
                redrawCanvas(strokes);
            }
        });

        socket.on("update-whiteboard", (updatedStrokes) => {
            if (Array.isArray(updatedStrokes)) {
                setCurrentStroke((prev) => {
                    const mergedStrokes = [...prev, ...updatedStrokes];
                    // Redraw with mergedStrokes, not currentStroke.
                    redrawCanvas(mergedStrokes);
                    return mergedStrokes;
                });
            }
        });

        return () => {
            socket.off("load-whiteboard");
            socket.off("update-whiteboard");
        };
    }, [roomId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 800;
        canvas.height = 500;
        canvas.style.border = "2px solid black";

        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
        ctxRef.current = ctx;
    }, []);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        setDrawing(true);
        setCurrentStroke([{ x: offsetX, y: offsetY }]);
    };

    const draw = (e) => {
        if (!drawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();

        // Update current stroke
        setCurrentStroke((prev) => [...prev, { x: offsetX, y: offsetY }]);
    };

    const stopDrawing = () => {
        ctxRef.current.closePath();
        setDrawing(false);

        // Emit the completed stroke to the server
        if (currentStroke.length > 0) {
            socket.emit("draw", roomId, currentStroke);
            setCurrentStroke([]); // Reset current stroke
        }
    };

    const redrawCanvas = (strokes) => {
        const ctx = ctxRef.current;
        if(strokes.length === 0){
            return;
        }

        if(strokes.length === 1 && strokes[0].x === undefined){
            ctx.clearRect(0, 0, 800, 500);
            return;
        }

        ctx.beginPath();
        strokes.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        });
        ctx.closePath();
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">Custom Real-Time Whiteboard</h1>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
        </div>
    );
};

export default Whiteboard;