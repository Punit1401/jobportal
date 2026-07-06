const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const candidateSchema = new Schema({
    formalEducations: [
      {
        type: { type: String },
        year: String,
      }
    ],
    nonFormalEducations: [
      {
        type: { type: String },
        year: String,
      }
    ],
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

const c = new Candidate({
  formalEducations: [{ type: "Graduation", year: "2020" }],
  nonFormalEducations: [{ type: "ITI", year: "2019" }]
});

console.log("Candidate formal:", c.formalEducations);
console.log("Candidate nonFormal:", c.nonFormalEducations);
