const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");

const app = express();
const port = 4004;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Helper function to write to file
const writeToFile = (data) => {
  fs.writeFileSync("./MOCK_DATA.json", JSON.stringify(data, null, 2));
};

// HTML Document Render
app.get("/users", (req, res) => {
  const html = `
    <ul>
      ${users.map(user => `<li>${user.first_name} ${user.last_name}</li>`).join("")}
    </ul>
  `;
  res.send(html);
});

// RESTful API to get all users
app.get("/api/users", (req, res) => {
  return res.json(users);
});

// Get user by ID
app.get("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  return res.json(user);
});

// Create new user
app.post("/api/users", (req, res) => {
  const body = req.body;
  
  if (!body.first_name || !body.last_name || !body.email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newUser = {
    id: users.length + 1,
    ...body
  };
  
  users.push(newUser);
  writeToFile(users);
  
  return res.status(201).json(newUser);
});

// Update user
app.patch("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  
  const userIndex = users.findIndex((user) => user.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex] = {
    ...users[userIndex],
    ...body,
    id: id // Ensure ID doesn't get changed
  };
  
  writeToFile(users);
  return res.json(users[userIndex]);
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const userIndex = users.findIndex((user) => user.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);
  
  writeToFile(users);
  return res.json(deletedUser);
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
