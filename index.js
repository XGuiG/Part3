require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { request, response } = require("express/lib/express");
const app = express();

const Person = require("./models/person");

let persons = [];
app.use(cors());

morgan.token("extentionJSON", (request, response) =>
  JSON.stringify(request.body)
);
morgan.format(
  "post",
  ":method :url :status :res[content-length] - :response-time ms :extentionJSON"
);
app.use(morgan("post"));
app.use(express.static("build"));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const date = new Date();
  response.send(
    `<div><p>Phonebook has info for ${persons.length} persons</p>${date}</div>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    // response.json(person);
    Person.findById(request.params.id).then((person) => {
      response.json(person);
    });
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

app.use(express.json());
// app.use(morgan.token());
app.post("/api/persons", (request, response) => {
  const body = request.body;
  // console.log(request.body)
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name missing/number missing",
    });
  }
  //   else if (persons.find((p) => p.name === body.name)) {
  //     return response.status(409).json({
  //       error: "name must be unique",
  //     });
  //   }

  const person = new Person({
    // id: parseInt(Math.random() * 100),
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });

  //   persons = persons.concat(person);
  //   response.json(person);
  //   console.log(request.body)
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
