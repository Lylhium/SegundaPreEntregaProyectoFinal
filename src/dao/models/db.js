import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

mongoose.connect(
  `mongodb+srv://lilius:dEADLERDEATH123@cluster0.gsoks.mongodb.net/`,
  {
    dbName: "ecommerce",
  }
);

mongoose.plugin(mongoosePaginate);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error en conectarse a MongoDB"));
db.once("open", () => {
  console.log("Conexión satisfactoria a MongoDB");
});

export default db;
