const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const app = express()

app.use(express.static("dist"))
app.use(cors())

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: "1",
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: "2",
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: "3",
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: "4",
  },
]
const datetime = new Date()

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

app.use(express.json())

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
})

app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
<p>${datetime}</p>`)
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

const generateId = () => {
  const randomId = Math.floor(Math.random() * (100 - 1 + 1)) + 1
  return String(randomId)
}

app.post("/api/persons", (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    })
  } else {
    const personExist = persons.find((person) => person.name === body.name)

    if (personExist) {
      response.status(400).json({
        error: "name must be unique",
      })
    } else {
      const person = {
        name: body.name,
        number: body.number || "",
        id: generateId(),
      }

      persons = persons.concat(person)
      response.json(person)
    }
  }
})

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id
  const person = persons.find((person) => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id
  persons = persons.filter((person) => person.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
