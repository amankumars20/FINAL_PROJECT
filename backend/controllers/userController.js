import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const roomId = `room_${user._id}`; // 👈 Generate room ID

    res.status(201).json({
      message: "User created successfully",
      token,
      user,
      roomId // 👈 Send to frontend
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message || "Something went wrong",
    });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const roomId = `room_${user._id}`; // 👈 Generate room ID

    res.status(200).json({
      message: "Login successful",
      token,
      user,
      roomId // 👈 Send to frontend
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message || error,
    });
  }
};


  export const getAllusers = async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $lookup: {
            from: 'roles', // Ensure this matches your roles collection name
            localField: 'role', // Field in the User document referencing the Role
            foreignField: '_id', // Field in the Role document that is referenced
            as: 'roleDetails', // Alias for the populated role data
          },
        },
        {
          $unwind: {
            path: '$roleDetails', // Unwind roleDetails to work with individual roles
            preserveNullAndEmptyArrays: true, // Include users with no matching role
          },
        },
        {
          $match: {
            $or: [
              { 'roleDetails.name': { $nin: ['superadmin', 'admin'] } }, // Exclude specific roles
              { roleDetails: { $eq: null } }, // Include users with no matching role
            ],
          },
        },
      ]);
      

      res.status(200).json({ users });
    } catch (error) {
      // console.error(error); // Log error for detailed debugging
      res.status(500).json({ message: "Error retrieving users", error });
    }
  };














// import User from "../models/User.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// export const signUp = async (req, res) => {
//     const { name, email, password } = req.body;
//     console.log(req.body)
//     const JWT_SECRET = process.env.JWT_SECRET;
  
   
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
  
//     try {
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ message: "Email already exists" });
//       }
  
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Create new user
//       const user = new User({ name, email, password: hashedPassword });
//       await user.save();
//       const token = jwt.sign({ id: user._id,name:user.name,email:user.email }, JWT_SECRET, { expiresIn: "1d" });
//       res.status(201).json({
//         message: "User created successfully", token,user 
//       });
//     } catch (error) {      
//       res.status(500).json({
//         message: "Server error",
//         error: error.message || "Something went wrong",
//       });
//     }
//   };
//   export const Login = async (req, res) => {
//     const { email, password } = req.body;
//     const JWT_SECRET = process.env.JWT_SECRET;
//       try {
//         const user = await User.findOne({ email });
        
//         if (!user) {
//           return res.status(400).json({ message: "Invalid email or password" });
//         }

//         const isPasswordValid = await user.comparePassword(password);
//         if (!isPasswordValid) {
//           return res.status(400).json({ message: "Invalid email orcdd password" });
//         }
//         const token = jwt.sign({ id: user._id,name:user.name,email:user.email }, JWT_SECRET, { expiresIn: "1d" });
//         res.json({ message: "Login successful", token,user });
//       } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message || error });
//       }
//   };

//   export const getAllusers = async (req, res) => {
//     try {
//       const users = await User.aggregate([
//         {
//           $lookup: {
//             from: 'roles', // Ensure this matches your roles collection name
//             localField: 'role', // Field in the User document referencing the Role
//             foreignField: '_id', // Field in the Role document that is referenced
//             as: 'roleDetails', // Alias for the populated role data
//           },
//         },
//         {
//           $unwind: {
//             path: '$roleDetails', // Unwind roleDetails to work with individual roles
//             preserveNullAndEmptyArrays: true, // Include users with no matching role
//           },
//         },
//         {
//           $match: {
//             $or: [
//               { 'roleDetails.name': { $nin: ['superadmin', 'admin'] } }, // Exclude specific roles
//               { roleDetails: { $eq: null } }, // Include users with no matching role
//             ],
//           },
//         },
//       ]);
      

//       res.status(200).json({ users });
//     } catch (error) {
//       // console.error(error); // Log error for detailed debugging
//       res.status(500).json({ message: "Error retrieving users", error });
//     }
//   };