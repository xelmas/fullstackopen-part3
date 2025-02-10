require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const app = express()
const Person = require("./models/person")

app.use(express.static("dist"))
app.use(cors())
app.use(express.json())

// let persons = [
//   {
//     name: "Arto Hellas",
//     number: "040-123456",
//     id: "1",
//   },
//   {
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//     id: "2",
//   },
//   {
//     name: "Dan Abramov",
//     number: "12-43-234345",
//     id: "3",
//   },
//   {
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//     id: "4",
//   },
// ]

morgan.token("body", (req) => JSON.stringify(req.body))
const postLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body"
)

app.use((req, res, next) => {
  if (req.method === "POST") {
    postLogger(req, res, next)
  } else {
    morgan("tiny")(req, res, next)
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
})

app.get("/info", async (request, response) => {
  const personCount = await Person.countDocuments()
  const datetime = new Date()
  response.send(`<p>Phonebook has info for ${personCount} people</p>
<p>${datetime}</p>`)
})

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

const generateId = () => {
  const randomId = Math.floor(Math.random() * (100 - 1 + 1)) + 1
  return String(randomId)
}

app.post("/api/persons", (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId(),
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
