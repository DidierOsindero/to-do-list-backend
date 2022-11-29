import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addDbItem,
  getAllDbItems,
  getDbItemById,
  updateDbItemById,
  IToDoData,
  deleteDbItemById
} from "./db";

export interface ItoDoText {
  text: string;
}
import filePath from "./filePath";

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /to-dos
app.get("/to-dos", (req, res) => {
  const allToDos = getAllDbItems();
  res.status(200).json(allToDos);
});

// POST /to-dos
app.post<{}, {}, ItoDoText>("/to-dos", (req, res) => {
  const postData = req.body;
  const createdToDo = addDbItem(postData);
  res.status(201).json(createdToDo);
});

// GET /to-dos/:id
app.get<{ id: string }>("/to-dos/:id", (req, res) => {
  const matchingToDo = getDbItemById(parseInt(req.params.id));
  if (matchingToDo === "not found") {
    res.status(404).json(matchingToDo);
  } else {
    res.status(200).json(matchingToDo);
  }
});

// DELETE /to-dos/:id
app.delete<{ id: string }>("/to-dos/:id", (req, res) => {
  const matchingToDo = getDbItemById(parseInt(req.params.id));

  if (matchingToDo === "not found") {
    res.status(404).json(matchingToDo);
  } else {
    deleteDbItemById(parseInt(req.params.id));
    res.status(200).json(matchingToDo);
  }
});

// PATCH /to-dos/:id
app.patch<{ id: string }, {}, Partial<IToDoData>>("/to-dos/:id", (req, res) => {
  const matchingToDo = updateDbItemById(parseInt(req.params.id), req.body);
  if (matchingToDo === "not found") {
    res.status(404).json(matchingToDo);
  } else {
    res.status(200).json(matchingToDo);
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
