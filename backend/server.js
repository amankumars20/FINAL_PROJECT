

import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import _ from "lodash";
import userRoutes from "./Routes/userRoutes.js";

const debounce = _.debounce;

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));


const documentSchema = new mongoose.Schema({
    _id: String,
    userId: { type: String, default: null },
    content: String,
    isReadOnly: { type: Boolean, default: false }
});
const Document = mongoose.model("Document", documentSchema);
const whiteboardSchema = new mongoose.Schema({
    _id: String,
    strokes: Array,
    userId:{ type: String, default: null },
    viewOnly: { type: Boolean, default: false },
});
const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);

const findOrCreateDocument = async (roomId) => {
    if (!roomId) return null;
    try {
        return await Document.findOneAndUpdate(
            { _id: roomId },
            { $setOnInsert: { content: "" } },
            { upsert: true, new: true }
        );
    } catch (error) {
        // console.error("❌ Error finding/creating document:", error);
        return null;
    }
};

const findOrCreateWhiteboard = async (roomId) => {
    if (!roomId) return null;
    try {
        return await Whiteboard.findOneAndUpdate(
            { _id: roomId },
            { $setOnInsert: { strokes: [] } },
            { upsert: true, new: true }
        );
    } catch (error) {
        // console.error("❌ Error finding/creating whiteboard:", error);
        return null;
    }
};

const debouncedUpdateDocument = debounce(async (roomId, content,userId) => {
    await Document.findByIdAndUpdate(roomId,{ content, userId });
}, 1000);



io.on("connection", (socket) => {

    socket.on("get-document", async (roomId) => {
        const document = await findOrCreateDocument(roomId);
        if (document) {
            socket.join(roomId);
            socket.emit("load-document", document.content);
            socket.emit("receive-readonly-status", { isReadOnly: document.isReadOnly, ownerId: document.userId });
        }
    });
    
    socket.on("send-changes", (roomId, content,userId) => {

        socket.broadcast.to(roomId).emit("receive-changes", content);
        debouncedUpdateDocument(roomId, content,userId);
    });

  
socket.on("update-readonly-status", async (roomId, status, userId) => {
    const document = await Document.findById(roomId);
    if (document && document.ownerId === userId) {
        await Document.findByIdAndUpdate(roomId, { isReadOnly: status });
        socket.broadcast.to(roomId).emit("receive-readonly-status", { isReadOnly: status, ownerId: userId });
    }
});
    // WHITEBOARD
    socket.on("toggle-view-only", async (roomId, userId) => {
        const whiteboard = await Whiteboard.findById(roomId);
        if (!whiteboard || whiteboard.userId !== userId) return;
            
        const newStatus = !whiteboard.viewOnly;
        await Whiteboard.findByIdAndUpdate(roomId, { viewOnly: newStatus });
        io.to(roomId).emit("update-view-only", newStatus);

    });
    
    socket.on("get-whiteboard", async (roomId, userId) => {
    const whiteboard = await Whiteboard.findOneAndUpdate(
        { _id: roomId },
        { $setOnInsert: { strokes: [], viewOnly: false, userId } },
        { upsert: true, new: true }
    );

    socket.join(roomId);
    socket.emit("load-whiteboard", whiteboard.strokes);
    socket.emit("receive-status", true);
    socket.emit("update-view-only", {
        viewOnly: whiteboard.viewOnly,
        userId: whiteboard.userId
    });
});

    
    const debouncedUpdateWhiteboard = debounce(async (roomId,filteredData) => {        
            await Whiteboard.findByIdAndUpdate(
                roomId,
                { $set: { strokes: filteredData } },
                { upsert: true, new: true });
    }, 1000);

    socket.on("draw", async (roomId, userId,serializedData) => {
        
        const whiteboard = await Whiteboard.findById(roomId);
        if (!whiteboard) return;

        if (whiteboard.viewOnly) {
            if (whiteboard.userId !== userId) return;
        }      
        const erasedStrokes = serializedData.filter(stroke => stroke?.isDeleted);
        if (!serializedData || !Array.isArray(serializedData)) return;
        const filteredData = serializedData.filter(stroke => !stroke?.isDeleted);
        const erasedIds = erasedStrokes.map(stroke => stroke.id);

        
        if (erasedStrokes.length > 0) {
    
            await Whiteboard.updateOne(
                { _id: roomId },
                { $pull: { strokes: { id: { $in: erasedIds } } } },
                { new: true }
            );
    
            socket.broadcast.to(roomId).emit("update-whiteboard", filteredData);
        }
        if (filteredData.length > 0) {
            socket.broadcast.to(roomId).emit("update-whiteboard", filteredData);
            debouncedUpdateWhiteboard(roomId, filteredData);
        }
    });
    
    socket.on("update-move", (roomId, zoomLevel) => {
        socket.to(roomId).emit("update-move", zoomLevel); // Broadcast to others
    });
    socket.on("zoom-change", (roomId, zoomLevel) => {
        socket.to(roomId).emit("zoom-change", zoomLevel); // Broadcast to others
    });
    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });

});

app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));











// import express from "express";
// import http from "http";
// import mongoose from "mongoose";
// import cors from "cors";
// import { Server } from "socket.io";
// import dotenv from "dotenv";
// import _ from "lodash";
// import userRoutes from "./Routes/userRoutes.js";

// const debounce = _.debounce;

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//     },
// });

// app.use(cors());
// app.use(express.json());

// mongoose
//     .connect(process.env.MONGO_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
//     .then(() => console.log("✅ MongoDB Connected"))
//     .catch((err) => console.error("❌ MongoDB Connection Error:", err));


// const documentSchema = new mongoose.Schema({
//     _id: String,
//     userId: { type: String, default: null },
//     content: String,
//     isReadOnly: { type: Boolean, default: false }
// });
// const Document = mongoose.model("Document", documentSchema);
// const whiteboardSchema = new mongoose.Schema({
//     _id: String,
//     strokes: Array,
//     userId:{ type: String, default: null },
//     viewOnly: { type: Boolean, default: false },
// });
// const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);

// const findOrCreateDocument = async (roomId) => {
//     if (!roomId) return null;
//     try {
//         return await Document.findOneAndUpdate(
//             { _id: roomId },
//             { $setOnInsert: { content: "" } },
//             { upsert: true, new: true }
//         );
//     } catch (error) {
//         // console.error("❌ Error finding/creating document:", error);
//         return null;
//     }
// };

// const findOrCreateWhiteboard = async (roomId) => {
//     if (!roomId) return null;
//     try {
//         return await Whiteboard.findOneAndUpdate(
//             { _id: roomId },
//             { $setOnInsert: { strokes: [] } },
//             { upsert: true, new: true }
//         );
//     } catch (error) {
//         // console.error("❌ Error finding/creating whiteboard:", error);
//         return null;
//     }
// };

// const debouncedUpdateDocument = debounce(async (roomId, content,userId) => {
//     await Document.findByIdAndUpdate(roomId,{ content, userId });
// }, 1000);



// io.on("connection", (socket) => {

//     socket.on("get-document", async (roomId) => {
//         const document = await findOrCreateDocument(roomId);
//         if (document) {
//             socket.join(roomId);
//             socket.emit("load-document", document.content);
//             socket.emit("receive-readonly-status", { isReadOnly: document.isReadOnly, ownerId: document.userId });
//         }
//     });
    
//     socket.on("send-changes", (roomId, content,userId) => {

//         socket.broadcast.to(roomId).emit("receive-changes", content);
//         debouncedUpdateDocument(roomId, content,userId);
//     });

  
// socket.on("update-readonly-status", async (roomId, status, userId) => {
//     const document = await Document.findById(roomId);
//     if (document && document.ownerId === userId) {
//         await Document.findByIdAndUpdate(roomId, { isReadOnly: status });
//         socket.broadcast.to(roomId).emit("receive-readonly-status", { isReadOnly: status, ownerId: userId });
//     }
// });
//     // WHITEBOARD
//     socket.on("toggle-view-only", async (roomId, userId) => {
//         const whiteboard = await Whiteboard.findById(roomId);
//         if (!whiteboard || whiteboard.userId !== userId) return;
            
//         const newStatus = !whiteboard.viewOnly;
//         await Whiteboard.findByIdAndUpdate(roomId, { viewOnly: newStatus });
//         io.to(roomId).emit("update-view-only", newStatus);

//     });
    
//     socket.on("get-whiteboard", async (roomId, userId) => {
//         let whiteboard = await Whiteboard.findOne({ _id: roomId }).populate("strokes");
    
//         if (!whiteboard) {
//             whiteboard = new Whiteboard({
//                 _id: roomId,
//                 strokes: [],
//                 viewOnly: false,
//                 userId,
//             });
    
//             await whiteboard.save();
//         }
    
//         socket.join(roomId);
        
//         socket.emit("load-whiteboard", whiteboard.strokes);
//         socket.emit("receive-status", true);
//         socket.emit("update-view-only", { viewOnly: whiteboard.viewOnly, userId: whiteboard.userId } || false);
//     });
    
//     const debouncedUpdateWhiteboard = debounce(async (roomId,filteredData) => {        
//             await Whiteboard.findByIdAndUpdate(
//                 roomId,
//                 { $set: { strokes: filteredData } },
//                 { upsert: true, new: true });
//     }, 1000);

//     socket.on("draw", async (roomId, userId,serializedData) => {
        
//         const whiteboard = await Whiteboard.findById(roomId);
//         if (!whiteboard) return;

//         if (whiteboard.viewOnly) {
//             if (whiteboard.userId !== userId) return;
//         }      
//         const erasedStrokes = serializedData.filter(stroke => stroke?.isDeleted);
//         if (!serializedData || !Array.isArray(serializedData)) return;
//         const filteredData = serializedData.filter(stroke => !stroke?.isDeleted);
//         const erasedIds = erasedStrokes.map(stroke => stroke.id);

        
//         if (erasedStrokes.length > 0) {
    
//             await Whiteboard.updateOne(
//                 { _id: roomId },
//                 { $pull: { strokes: { id: { $in: erasedIds } } } },
//                 { new: true }
//             );
    
//             socket.broadcast.to(roomId).emit("update-whiteboard", filteredData);
//         }
//         if (filteredData.length > 0) {
//             socket.broadcast.to(roomId).emit("update-whiteboard", filteredData);
//             debouncedUpdateWhiteboard(roomId, filteredData);
//         }
//     });
    
//     socket.on("update-move", (roomId, zoomLevel) => {
//         socket.to(roomId).emit("update-move", zoomLevel); // Broadcast to others
//     });
//     socket.on("zoom-change", (roomId, zoomLevel) => {
//         socket.to(roomId).emit("zoom-change", zoomLevel); // Broadcast to others
//     });
//     socket.on("disconnect", () => {
//         console.log("❌ User disconnected:", socket.id);
//     });

// });

// app.use('/api', userRoutes);

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));