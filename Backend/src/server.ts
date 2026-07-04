import app from "./app";
import { env } from "./Config/env";
import connectDB from "./DB/Connections/mongo";

connectDB();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
