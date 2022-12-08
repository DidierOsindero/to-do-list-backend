import express, { response } from "express";
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
app.post<{}, {}, ItoDoText>("/to-dos", async (req, res) => {
  const postData = req.body;
  const text = "INSERT INTO todos (task) VALUES ($1) RETURNING *";
  const values = [postData.text];
  const queryResponse = await client.query(text, values);
  const createdToDo = queryResponse.rows[0];
  res.status(201).json(createdToDo);
});

// GET /to-dos/:id
app.get<{ id: string }>("/to-dos/:id", async (req, res) => {
  const id = req.params.id;
  const text = "SELECT * FROM todos WHERE id = $1";
  const values = [id];
  const queryResponse = await client.query(text, values);
  const matchingToDo = queryResponse.rows[0];
  res.status(200).json(matchingToDo);
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
app.patch<{ id: string }, {}, Partial<IToDoData>>(
  "/to-dos/:id",
  async (req, res) => {
    const postData = req.body;

    try {
      if (postData.text && postData.complete !== undefined) {
        const text =
          "UPDATE todos SET task = $1, complete = $2 WHERE id = $3 RETURNING *";
        const values = [postData.text, postData.complete, req.params.id];
        const queryResponse = await client.query(text, values);
        const updatedToDo = queryResponse.rows[0];
        res.status(200).json(updatedToDo);
      } else if (
        postData.text === undefined &&
        postData.complete !== undefined
      ) {
        const text = "UPDATE todos SET complete = $1 WHERE id = $2 RETURNING *";
        const values = [postData.complete, req.params.id];
        const queryResponse = await client.query(text, values);
        const updatedToDo = queryResponse.rows[0];
        res.status(200).json(updatedToDo);
      } else if (postData.text && postData.complete === undefined) {
        const text = "UPDATE todos SET task = $1 WHERE id = $2 RETURNING *";
        const values = [postData.text, req.params.id];
        const queryResponse = await client.query(text, values);
        const updatedToDo = queryResponse.rows[0];
        res.status(200).json(updatedToDo);
      }
    } catch (error) {
      console.error(error);
    }
  }
);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
