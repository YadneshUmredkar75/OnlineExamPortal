import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Direct MongoDB URL (for testing only)
    const MONGO_URI = "mongodb://127.0.0.1:27017/online_exam_portal";

    const conn = await mongoose.connect(MONGO_URI);

    console.log("=================================");
    console.log(" MongoDB was connected successfully");
    console.log(` Host: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    console.log("=================================");
  } catch (error) {
    console.error(" MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
