// import mongoose from "mongoose";

// export async function connectDB() {
//   const uri = process.env.MONGO_URI;

//   if (!uri) {
//     throw new Error("MONGO_URI is missing");
//   }

//   await mongoose.connect(uri, {
//     dbName: "sps_accounting"
//   });

//   console.log("✅ MongoDB connected");
// }


import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "sps_accounting",
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
}
