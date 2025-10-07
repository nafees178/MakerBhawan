import Events from "@/models/event_model";
import Projects from "@/models/project_model";
import Inventory from "@/models/inventory_model";
import { connectToMongoDB } from "./db";
import { revalidatePath } from "next/cache";

export const getEvents = async () => {
  await connectToMongoDB();

  try {
    const event = await Events.find();
    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    console.log(error);
    return { message: "error fetching events" };
  }
};


export const getProjects = async () => {
  await connectToMongoDB();

  try {
    const project = await Projects.find();
    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.log(error);
    return { message: "error fetching events" };
  }
};


export const getInventory = async () => {
  await connectToMongoDB();

  try {
    const inventory = await Inventory.find();
    return JSON.parse(JSON.stringify(inventory));
  } catch (error) {
    console.log(error);
    return { message: "error fetching inventory" };
  }
};