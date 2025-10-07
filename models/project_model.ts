import mongoose, { Document, Model } from "mongoose";

export interface IProjects {
    name: string,
    description: string
}

export interface IProjectsDocument extends IProjects, Document {
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProjectsDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields to the document
    timestamps: true,
  }
);

const Projects: Model<IProjectsDocument> =
  mongoose.models?.Projects || mongoose.model("Projects", projectSchema);

export default Projects;