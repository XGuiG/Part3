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
  "json",
  ":method :url :status :res[content-length] - :response-time ms :extentionJSON"
);
app.use(morgan("json"));
app.use(express.static("build"));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const date = new Date();
  Person.find({}).then((persons) => {
    response.send(
      `<div><p>Phonebook has info for ${persons.length} persons</p>${date}</div>`
    );
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.use(express.json());
// app.use(morgan.token());
app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  // console.log(request.body)
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name / number missing",
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

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));

  //   persons = persons.concat(person);
  //   response.json(person);
  //   console.log(request.body)
});

app.put("/api/persons/:id", (request, response, next) => {
  const {name, number} = request.body;
//   console.log(body);
//   const person = {
//     name: body.name,
//     number: body.number,
//   };

  Person.findByIdAndUpdate(request.params.id, 
    {name, number}, 
    { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
