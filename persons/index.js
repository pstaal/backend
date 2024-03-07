require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const Person = require("./models/person");
app.use(cors());

const morgan = require("morgan");

app.use(express.static("dist"));

app.use(express.json());
morgan.token("type", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(morgan(":method :url :status :response-time ms :type"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${
      persons.length
    } people</p><p>${new Date().toString()}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  // if (!body.name || !body.number) {
  //   return response.status(400).json({
  //     error: "name and/or number is missing",
  //   });
  // }

  // let nameExists = persons.find(
  //   (person) => person.name.toLowerCase() === body.name.toLowerCase()
  // );

  // if (nameExists) {
  //   return response.status(400).json({
  //     error: "name must be unique",
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
