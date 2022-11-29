import { ItoDoText } from "./server";
export interface IToDoData {
  id: number;
  text: string;
  complete: boolean;
}

const db: IToDoData[] = [];

/** Variable to keep incrementing id of database items */
let idCounter = 0;

/**
 * Adds in a single item to the database
 *
 * @param data - the item data to insert in
 * @returns the item added (with a newly created id)
 */
export const addDbItem = (data: ItoDoText): IToDoData => {
  const newEntry: IToDoData = {
    id: ++idCounter,
    text: data.text,
    complete: false,
  };
  db.unshift(newEntry);
  return newEntry;
};

/**
 * Deletes a database item with the given id
 *
 * @param id - the id of the database item to delete
 * @returns the deleted database item (if originally located),
 *  otherwise the string `"not found"`
 */
export const deleteDbItemById = (id: number): IToDoData | "not found" => {
  const idxToDeleteAt = findIndexOfDbItemById(id);
  if (typeof idxToDeleteAt === "number") {
    const itemToDelete = getDbItemById(id);
    db.splice(idxToDeleteAt, 1); // .splice can delete from an array
    return itemToDelete;
  } else {
    return "not found";
  }
};

/**
 * Deletes all completed to-dos in the database
 *
 * @returns an array containing the deleted database items (if originally located),
 *  otherwise the string `"no complete to dos"`
 */

export const deleteCompletedDbItems = ():
  | IToDoData[]
  | "no complete to dos" => {
  const deletedToDoArr: IToDoData[] = [];
  for (let i = 0; i < db.length; i++) {
    if (db[i].complete === true) {
      const deletedToDo = db.splice(Number(i), 1);
      deletedToDoArr.push(deletedToDo[0]);
      i--;
    }
  }

  if (deletedToDoArr.length > 0) {
    return deletedToDoArr;
  }

  return "no complete to dos";
}; 

/**
 * Finds the index of a database item with a given id
 *
 * @param id - the id of the database item to locate the index of
 * @returns the index of the matching database item,
 *  otherwise the string `"not found"`
 */
const findIndexOfDbItemById = (id: number): number | "not found" => {
  const matchingIdx = db.findIndex((entry) => entry.id === id);
  // .findIndex returns -1 if not located
  if (matchingIdx !== -1) {
    return matchingIdx;
  } else {
    return "not found";
  }
};

/**
 * Find all database items
 * @returns all database items from the database
 */
export const getAllDbItems = (): IToDoData[] => {
  return db;
};

/**
 * Locates a database item by a given id
 *
 * @param id - the id of the database item to locate
 * @returns the located database item (if found),
 *  otherwise the string `"not found"`
 */
export const getDbItemById = (id: number): IToDoData | "not found" => {
  const maybeEntry = db.find((entry) => entry.id === id);
  if (maybeEntry) {
    return maybeEntry;
  } else {
    return "not found";
  }
};

/**
 * Applies a partial update to a database item for a given id
 *  based on the passed data
 *
 * @param id - the id of the database item to update
 * @param newData - the new data to overwrite
 * @returns the updated database item (if one is located),
 *  otherwise the string `"not found"`
 */
export const updateDbItemById = (
  id: number,
  newData: Partial<IToDoData>
): IToDoData | "not found" => {
  const idxOfEntry = findIndexOfDbItemById(id);
  // type guard against "not found"
  if (typeof idxOfEntry === "number") {
    return Object.assign(db[idxOfEntry], newData);
  } else {
    return "not found";
  }
};
