import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on("connected", () => console.log("DataBase Connected."));
    await mongoose.connect(`${process.env.MONGODB_URL}/MERN_AUTH`);
};

export default connectDB;