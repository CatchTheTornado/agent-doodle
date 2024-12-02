export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
}