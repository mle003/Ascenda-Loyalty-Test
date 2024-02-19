const express = require("express");
const { getHotelById, updatedHotelsData, getHotelByDestinationId } = require("./hotels/hotels-controller")

const app = express();
const port = 3000;

app.get("/hotel_id", async (req, res) => {
	try {
		res.send(getHotelById(req))
	} catch (error) {
		res.status(400).send({
			message: error.message
		})
	}
});

app.get("/hotel_destination", async (req, res) => {
	try {
		res.send(getHotelByDestinationId(req))
	} catch (error) {
		res.status(400).send({
			message: error.message
		})
	}
});

//update data from suppliers api
app.get("/update-data", async (req, res) => {
	try {
		res.send(updatedHotelsData(req))
	} catch(error) {
		res.status(400).send({
			message: error.message
		})
	}
})

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
