const express = require('express');
const router = express.Router();
const Pet = require('../models/petDetails');

// Route to add a new pet
router.post("/add-pet", async (req, res) => {
  const { pet_id, petName, petType, color, features, vaccinated } = req.body;

  // Validate input
  if (!pet_id || !petName || !petType || !color || !features) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
    // Create and save the new pet document
    const newPet = await Pet.create({
      pet_id, // Store the unique pet_id
      petName,
      petType,
      color,
      features,
      vaccinated: vaccinated || false, // Set to false if not provided
    });

    console.log(newPet);
    res.status(201).json({ status: "ok", message: "Pet added successfully", pet: newPet });
  } catch (error) {
    console.error("Error adding pet:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Route to get pet details by pet_id
router.get("/get-pet/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findOne({ pet_id: id }); // Find by pet_id

    if (!pet) {
      return res.status(404).json({ status: "error", message: "Pet not found" });
    }

    res.status(200).json({ status: "ok", pet });
  } catch (error) {
    console.error("Error fetching pet:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Route to get all unadopted pets
router.get('/unadopted', async (req, res) => {
  try {
    const pets = await Pet.find({ isAdopted: false });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to mark a pet as adopted
router.put('/adopt/:petId', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    pet.isAdopted = true;
    await pet.save();
    res.json({ message: 'Pet adopted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
