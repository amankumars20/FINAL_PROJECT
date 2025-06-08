import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Whiteboard = () => {
    const { roomId } = useParams();
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState([]);
    const [startPoint, setStartPoint] = useState(null);
    const [strokes, setStrokes] = useState([]);
    const [selectedShape, setSelectedShape] = useState("free");
    const [isEraser, setIsEraser] = useState(false);

    useEffect(() => {
        if (!roomId) return;
        socket.emit("get-whiteboard", roomId);

        socket.on("load-whiteboard", (loadedStrokes) => {
            if (Array.isArray(loadedStrokes)) {
                setStrokes(loadedStrokes);
                redrawCanvas(loadedStrokes);
            }
        });

        socket.on("update-whiteboard", (newStroke) => {
            if (newStroke) {
                setStrokes((prev) => {
                    const updatedStrokes = [...prev, newStroke];
                    redrawCanvas(updatedStrokes);
                    return updatedStrokes;
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

        if (isEraser) {
            eraseStroke(offsetX, offsetY);
            return;
        }

        setDrawing(true);
        setStartPoint({ x: offsetX, y: offsetY });

        if (selectedShape === "free") {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(offsetX, offsetY);
            setCurrentStroke([{ x: offsetX, y: offsetY }]);
        }
    };

    const draw = (e) => {
        if (!drawing || isEraser) return;
        const { offsetX, offsetY } = e.nativeEvent;

        if (selectedShape !== "free") {
            redrawCanvas(strokes);
        }

        if (selectedShape === "free") {
            ctxRef.current.lineTo(offsetX, offsetY);
            ctxRef.current.stroke();
            setCurrentStroke((prev) => [...prev, { x: offsetX, y: offsetY }]);
        } else {
            drawShape(startPoint.x, startPoint.y, offsetX, offsetY, selectedShape);
        }
    };

    const stopDrawing = (e) => {
        if (!drawing || isEraser) return;
        setDrawing(false);

        const { offsetX, offsetY } = e.nativeEvent;
        let newShape;

        if (selectedShape === "free") {
            newShape = { type: "free", points: [...currentStroke] };
        } else {
            newShape = {
                type: selectedShape,
                startX: startPoint.x,
                startY: startPoint.y,
                endX: offsetX,
                endY: offsetY,
            };
        }

        setStrokes((prevStrokes) => [...prevStrokes, newShape]);
        redrawCanvas([...strokes, newShape]);
        socket.emit("draw", roomId, newShape);
        setCurrentStroke([]);
    };

    const drawShape = (x1, y1, x2, y2, shapeType) => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.beginPath();
        if (shapeType === "rectangle") {
            ctx.rect(x1, y1, x2 - x1, y2 - y1);
        } else if (shapeType === "circle") {
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        } else if (shapeType === "line") {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        ctx.closePath();
    };

    const redrawCanvas = (strokes) => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        strokes.forEach((stroke) => {
            if (stroke.type === "free" && Array.isArray(stroke.points)) {
                ctx.beginPath();
                stroke.points.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.stroke();
                ctx.closePath();
            } else if (stroke.type) {
                drawShape(stroke.startX, stroke.startY, stroke.endX, stroke.endY, stroke.type);
            }
        });
    };

    const eraseStroke = (x, y) => {
        const newStrokes = strokes.filter((stroke) => {
            if (stroke.type === "free") {
                return !stroke.points.some((point) => Math.abs(point.x - x) < 10 && Math.abs(point.y - y) < 10);
            } else {
                return !(
                    x >= stroke.startX &&
                    x <= stroke.endX &&
                    y >= stroke.startY &&
                    y <= stroke.endY
                );
            }
        });

        setStrokes(newStrokes);
        redrawCanvas(newStrokes);
        socket.emit("erase", roomId, newStrokes);
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">Custom Real-Time Whiteboard</h1>
            <div className="mb-4">
                <label>Select Tool: </label>
                <select onChange={(e) => setSelectedShape(e.target.value)} value={selectedShape} disabled={isEraser}>
                    <option value="free">Free Draw</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="line">Line</option>
                </select>
                <button
                    onClick={() => setIsEraser(!isEraser)}
                    className={`ml-4 px-4 py-1 text-white ${isEraser ? "bg-red-500" : "bg-blue-500"}`}
                >
                    {isEraser ? "Stop Erasing" : "Eraser"}
                </button>
            </div>
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