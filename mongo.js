const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const inputname = process.argv[3];
const inputnumber = process.argv[4];

const url = `mongodb+srv://XGuig1234:${password}@cluster0.9r17ec1.mongodb.net/?retryWrites=true&w=majority`;
// console.log(url)
mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

// Note.find({ important: true }).then(result => {
//     result.forEach(note => {
//         console.log(note)
//     })
//     mongoose.connection.close()
// })

const person = new Person({
  name: inputname,
  number: inputnumber,
});

if (inputname && inputnumber) {
  person.save().then((result) => {
    console.log(`added ${inputname} ${inputnumber} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}
