import express from "express";
import path from "path";
import {fileURLToPath} from 'url';
import cookieParser from "cookie-parser";
import lessMiddleware from "less-middleware";

import indexRouter from "./routes/index.js";

const PORT = process.env.PORT || 4321;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.listen(PORT, () => console.log(`Server start on port ${PORT}.`))
