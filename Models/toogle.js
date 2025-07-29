import mongoose from "mongoose";
const mongodbURI =
  process.env.mongodbURI ||
  "mongodb+srv://ahmed:ahmed@cluster0.fydmmjd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
/////////////////////////////////////////////////////////////////////////////////////////////////

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const productSchema = new mongoose.Schema({
  projectName: { type: String },
  projectDescription: { type: String },
  imageUrl: { type: Array, required: true },
  createdOn: { type: Date, default: Date.now },
  paymentDetail: { type: Array },
  projectPrice: { type: Number },
});
export const tweetModel = mongoose.model("ProductsAll", productSchema);

const siteStatusSchema = new mongoose.Schema({
  _id: { type: String, default: "siteStatus" },
  isLive: { type: Boolean, default: true },
});

export const SiteStatus =  mongoose.model("SiteStatus", siteStatusSchema);

const User = mongoose.model("User", userSchema);
mongoose.connect(mongodbURI);
////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on("connected", function () {
  //connected
  console.log("Mongoose is connected");
});

mongoose.connection.on("disconnected", function () {
  //disconnected
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  //any error
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  /////this function will run jst before app is closing
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////

export default User;
