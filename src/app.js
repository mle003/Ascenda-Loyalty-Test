const express = require("express");
const fs = require("fs"); // Import for file operations
const axios = require("axios"); // Import for API calls
const {
	getHotelById,
	getAllHotels,
	getHotelByDestinationId,
	updatedHotelsData,
} = require("./hotels/hotels-controller");

const hotelsDataFilePath = "/data/hotels.json";
const suppliersDataFilePath = "/data/suppliers.json";

const app = express();
const port = 3000;

// Middleware to handle loading hotels data
app.use(async (req, res, next) => {
	try {
		const hotelsData = await getAllHotels(fs, hotelsDataFilePath); // Get data using the injected dependency
		req.hotelsData = hotelsData; // Attach data to request object
		next();
	} catch (error) {
		console.error("Error loading hotels data:", error);
		res.status(500).send({ message: "Error loading hotels data" });
	}
});

app.get("/hotel_id", (req, res) => {
	try {
		res.send(getHotelById(req.hotelsData, req)); // Pass hotelsData from middleware
	} catch (error) {
		res.status(400).send({ message: error.message });
	}
});

app.get("/hotel_destination", (req, res) => {
	try {
		res.send(getHotelByDestinationId(req.hotelsData, req)); // Pass hotelsData from middleware
	} catch (error) {
		res.status(400).send({ message: error.message });
	}
});

app.get("/update_data", async (req, res) => {
	try {
		await updatedHotelsData(hotelsDataFilePath, suppliersDataFilePath, fs, axios); // Provide dependencies
		res.send("Update data successfully");
	} catch (error) {
		res.status(400).send({ message: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
