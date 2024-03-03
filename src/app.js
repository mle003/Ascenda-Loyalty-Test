const express = require("express");
const fs = require("fs");
const axios = require("axios");
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

app.use(async (req, res, next) => {
	try {
		const hotelsData = await getAllHotels(fs, hotelsDataFilePath);
		next();
	} catch (error) {
		console.error("Error loading hotels data:", error);
		res.status(500).send({ message: "Error loading hotels data" });
	}
});

app.get("/hotel_id", (req, res) => {
	try {
		res.send(getHotelById(req.hotelsData, req));
	} catch (error) {
		res.status(400).send({ message: error.message });
	}
});

app.get("/hotel_destination", (req, res) => {
	try {
		res.send(getHotelByDestinationId(req.hotelsData, req));
	} catch (error) {
		res.status(400).send({ message: error.message });
	}
});

app.get("/update_data", async (req, res) => {
	try {
		await updatedHotelsData(hotelsDataFilePath, suppliersDataFilePath, fs, axios);
		res.send("Update data successfully");
	} catch (error) {
		res.status(400).send({ message: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

