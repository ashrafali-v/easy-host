const Service = require('../models/serviceModel');
const { createContainer } = require('../services/dockerService');

const registerService = async (req, res) => {
  const { githubRepoUrl } = req.body;

  try {
    await createContainer(githubRepoUrl);
    //const { containerId, serviceUrl } = await createContainer(githubRepoUrl);

    // const newService = new Service({
    //   githubRepoUrl,
    //   containerId,
    //   serviceUrl,
    // });

    //await newService.save();

    res.status(201).json({ message: 'Service registered' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering service' });
  }
};

module.exports = { registerService };
