import mongoose, { Connection } from "mongoose";

let cachedConnection: Connection | null = null;

export async function connectToMongoDB() {
  if (cachedConnection) {
    console.log("Using cached db connection");
    return cachedConnection;
  }
  try {
    const mongoUri = "mongodb+srv://b25bb1012_db_user:b25bb1012@maker-bhawan.phougbq.mongodb.net/?retryWrites=true&w=majority&appName=maker-bhawan";
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set');
    }
    const cnx = await mongoose.connect(mongoUri);
    cachedConnection = cnx.connection;
    console.log("New mongodb connection established");
    return cachedConnection;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
