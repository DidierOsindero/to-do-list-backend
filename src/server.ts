import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addDbItem,
  getAllDbItems,
  getDbItemById,
  updateDbItemById,
  IToDoData,
  deleteDbItemById,
  deleteCompletedDbItems,
} from "./db";
import filePath from "./filePath";
import { Client } from "pg";

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();
const PORT_NUMBER = process.env.PORT ?? 4000;

const client = new Client(process.env.DATABASE_URL);
client.connect();

export interface ItoDoText {
  text: string;
}

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /to-dos
app.get("/to-dos", async (req, res) => {
  const text = "SELECT * FROM todos";
  const queryResponse = await client.query(text);
  const allToDos = queryResponse.rows;
  res.status(200).json(allToDos);
});

// POST /to-dos
app.post<{}, {}, ItoDoText>("/to-dos", (req, res) => {
  const postData = req.body;
  const createdToDo = addDbItem(postData);
  res.status(201).json(createdToDo);
});

// GET /to-dos/:id
app.get<{ id: string }>("/to-dos/:id", async (req, res) => {
  const id = req.params.id;
  const text = "SELECT * FROM todos WHERE id = $1";
  const values = [id];
  const queryResponse = await client.query(text, values);
  const matchingToDo = queryResponse.rows[0];
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

// DELETE /completed-to-dos
app.delete("/completed-to-dos", (req, res) => {
  const returnedArr = deleteCompletedDbItems();
  if (returnedArr === "no complete to dos") {
    res.status(400).json(returnedArr);
  } else {
    res.status(200).json(returnedArr);
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
