import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema/schema.js";
import connectDB from "./config/connect.js";


dotenv.config();

const app=express();
const port=process.env.PORT||3000;

app.use(cors());
await connectDB();
// graphiql genereates a ui like postman on browser to test this api on url (localhost:port/graphql)
app.use("/graphql",graphqlHTTP({
  schema,
  graphiql:true

}))
app.listen(3000,()=>{
  console.log("Hello From Server" .yellow.underline.bold);
})