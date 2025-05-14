# Team06 Pet Adoption Portal

This project is a full-stack pet adoption portal composed of a Flask backend and a React (Vite) frontend.

## Prerequisites

- Docker and Docker Compose installed on your machine.
- (Optional) Git for version control.

## Running the Application without Docker
1. **Backend**
   ```bash
   cd backend
   python init_db.py
   python seed_db.py
   python main.py
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Access the Application:**

   - **Frontend:**  
     Open your web browser and navigate to [http://localhost:3000](http://localhost:3000) to view the React application.

   - **Backend:**  
     The Flask API is accessible at [http://localhost:5000](http://localhost:5000).



## Running the Application with Docker Compose

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Build and Start the Docker Containers:**

   At the root of the repository (where the `docker-compose.yml` resides), open your terminal and execute:

   ```bash
   docker-compose up --build
   ```

   This command builds the Docker images and starts both the frontend and backend containers.

3. **Access the Application:**

   - **Frontend:**  
     Open your web browser and navigate to [http://localhost:3000](http://localhost:3000) to view the React application.

   - **Backend:**  
     The Flask API is accessible at [http://localhost:5000](http://localhost:5000).

## Development Workflow

- **Live Code Updates:**

  The Docker Compose configuration mounts your local `./frontend` and `./backend` directories into the respective containers as volumes. This setup allows you to edit the code in your IDE (e.g., Visual Studio Code) and see changes in real time without needing to rebuild the container for every change.

- **Rebuilding Containers:**

  If you make changes to configuration files or add new dependencies, restart the containers with:

  ```bash
  docker-compose up --build
  ```

## Stopping the Application

To stop and remove the containers, press `CTRL+C` in the terminal running Docker Compose or execute:

```bash
docker-compose down
```

## Project Structure Overview

- **backend/**  
  Contains the Flask application code. The Dockerfile inside this folder builds the backend container.
  
- **frontend/**  
  Contains the React (Vite) application code. The Dockerfile inside this folder builds the frontend container.

- **docker-compose.yml**  
  Defines and orchestrates both the backend and frontend Docker containers.
