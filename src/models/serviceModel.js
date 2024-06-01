const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  githubRepoUrl: { type: String, required: true },
  containerId: { type: String, required: true },
  serviceUrl: { type: String, required: true },
});

module.exports = mongoose.model('Service', serviceSchema);