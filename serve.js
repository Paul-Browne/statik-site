import express from 'express';
import compression from 'compression';

const app = express();
app.use(compression());
app.use("/", express.static("public", {
    maxAge: 1000 * 1,
    extensions: ["html"]
}));

app.listen(3000, () => console.log("http://localhost:3000"));