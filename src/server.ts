import express, { response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getDbItemById, deleteDbItemById, deleteCompletedDbItems } from "./db";
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
  task: string;
}

export interface IToDoData {
  id: number;
  task: string;
  complete: boolean;
}

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /to-dos
app.get("/to-dos", async (req, res) => {
  try {
    const text = "SELECT * FROM todos";
    const queryResponse = await client.query(text);
    const allToDos = queryResponse.rows;
    res.status(200).json(allToDos);
  } catch (err) {
    console.error(err);
  }
});

// POST /to-dos
app.post<{}, {}, ItoDoText>("/to-dos", async (req, res) => {
  try {
    const postData = req.body;
    const text = "INSERT INTO todos (task) VALUES ($1) RETURNING *";
    const values = [postData.task];
    const queryResponse = await client.query(text, values);
    const createdToDo = queryResponse.rows[0];
    res.status(201).json(createdToDo);
  } catch (err) {
    console.error(err);
  }
});

// GET /to-dos/:id
app.get<{ id: string }>("/to-dos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const text = "SELECT * FROM todos WHERE id = $1";
    const values = [id];
    const queryResponse = await client.query(text, values);
    const matchingToDo = queryResponse.rows[0];
    res.status(200).json(matchingToDo);
  } catch (err) {
    console.error(err);
  }
});

// DELETE /completed-to-dos
app.delete("/completed-to-dos", async (req, res) => {
  try {
    const text = "DELETE FROM todos WHERE complete = true RETURNING *";
    const queryResponse = await client.query(text);
    const returnedArr = queryResponse.rows;
    res.status(200).json(returnedArr);
  } catch (err) {
    console.error(err);
  }
});

// PATCH /to-dos/:id
app.patch<{ id: string }, {}, Partial<IToDoData>>(
  "/to-dos/:id",
  async (req, res) => {
    const postData = req.body;

    try {
      if (postData.task && postData.complete !== undefined) {
        const text =
          "UPDATE todos SET task = $1, complete = $2 WHERE id = $3 RETURNING *";
        const values = [postData.task, postData.complete, req.params.id];
        const queryResponse = await client.query(text, values);
        const updatedToDo = queryResponse.rows[0];
        res.status(200).json(updatedToDo);
      } else if (
        postData.task === undefined &&
        postData.complete !== undefined
      ) {
        const text = "UPDATE todos SET complete = $1 WHERE id = $2 RETURNING *";
        const values = [postData.complete, req.params.id];
        const queryResponse = await client.query(text, values);
        const updatedToDo = queryResponse.rows[0];
        res.status(200).json(updatedToDo);
      } else if (postData.task && postData.complete === undefined) {
        const text = "UPDATE todos SET task = $1 WHERE id = $2 RETURNING *";
        const values = [postData.task, req.params.id];
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
