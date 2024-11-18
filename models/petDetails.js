const mongoose = require("mongoose");

// Define the schema for pet details
const PetSchema = new mongoose.Schema(
  {
    pet_id: {
      type: String,
      required: true,
      // unique: true, // Ensure each pet has a unique ID
    },
    petName: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    features: {
      type: String,
      required: true,
    },
    isAdopted: {
      type: Boolean,
      default: false, // Default to false, indicating the pet is not adopted
    },
    vaccinated: {
      type: Boolean,
      default: false, // Default to false, indicating the pet is not vaccinated
    },
  },
  {
    collection: "pets", // Specify collection name similar to User schema
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Export the schema as a model
module.exports = mongoose.model("pets", PetSchema);
