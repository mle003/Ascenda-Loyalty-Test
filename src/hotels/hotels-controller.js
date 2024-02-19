const axios = require("axios");
const fs = require("fs");

const hotelsDataFilePath = "/data/hotels.json";

const mergeHotelsData = (hotels, currentData) => {
    for (let hotel of hotels) {
        const id = (
            hotel.id ||
            hotel.Id ||
            hotel.hotel_id
        )
        if (!currentData[id]) currentData[id] = {}

        currentData[id]["destination_id"] = (
            hotel.destination_id ||
            hotel.DestinationId ||
            hotel.destination ||
            currentData[id]["destination_id"]
        )

        currentData[id]["hotel_name"] = (
            hotel.Name ||
            hotel.name ||
            hotel.hotel_name ||
            currentData[id]["hotel_name"]
        )

        currentData[id]["location"] = (currentData[id]["location"] || {})
        currentData[id]["location"]["lat"] = (
            hotel.Latitude ||
            hotel.lat ||
            currentData[id]["location"]["lat"]
        )
        currentData[id]["location"]["long"] = (
            hotel.Longitude ||
            hotel.lng ||
            currentData[id]["location"]["long"]
        )
        currentData[id]["location"]["address"] = (
            hotel.Address ||
            hotel.address ||
            hotel?.location?.address ||
            currentData[id]["location"]["address"]
        )
        currentData[id]["location"]["country"] = (
            hotel.Country ||
            hotel?.location?.country ||
            currentData[id]["location"]["country"]
        )

        currentData[id]["description"] = (
            hotel.Description ||
            currentData[id]["description"]
        )

        currentData[id]["amenities"] = (currentData[id]["amenities"] || {})
        currentData[id]["amenities"]["general"] = (currentData[id]["amenities"]["general"] || [])
        const amenities = (
            hotel?.amenities?.general ||
            hotel.Facilities ||
            hotel.amenities ||
            []
        )
        for (let amentity of amenities) {
            if (!currentData[id]["amenities"]["general"].includes(amentity)) {
                currentData[id]["amenities"]["general"].push(amentity)
            }
        }
        currentData[id]["amenities"]["room"] = (currentData[id]["amenities"]["room"] || [])
        const amenities_room = (
            hotel?.amenities?.room ||
            []
        )
        for (let amentity_room of amenities_room) {
            if (!currentData[id]["amenities"]["room"].includes(amentity_room)) {
                currentData[id]["amenities"]["room"].push(amentity_room)
            }
        }

        currentData[id]["images"] = (currentData[id]["images"] || {})
        currentData[id]["images"]["room"] = (currentData[id]["images"]["room"] || [])
        const room_images = (
            hotel.images?.rooms ||
            []
        )
        for (let image of room_images) {
            currentData[id]["images"]["room"].push(image)
        }

        currentData[id]["images"]["site"] = (currentData[id]["images"]["site"] || [])
        const site_images = (
            hotel.images?.site ||
            []
        )
        for (let image of site_images) {
            currentData[id]["images"]["site"].push(image)
        }

        currentData[id]["images"]["amenities"] = (currentData[id]["images"]["amenities"] || [])
        const amenities_images = (
            hotel.images?.site ||
            []
        )
        for (let image of amenities_images) {
            currentData[id]["images"]["amenities"].push(image)
        }

        currentData[id]["booking_condition"] = (currentData[id]["booking_condition"] || [])
        const booking_condition = (
            hotel.booking_conditions ||
            []
        )
        for (let condition of booking_condition) {
            if (!currentData[id]["booking_condition"].includes(condition)) {
                currentData[id]["booking_condition"].push(condition)
            }
        }
    }

    return currentData
};

const updatedHotelsData = async () => {
    const currentHotelsData = require(__dirname + hotelsDataFilePath)

    const suppliersDataFilePath = "/data/suppliers.json"
    const suppliers = require(__dirname + suppliersDataFilePath)

    try {
        const hotelPromises = suppliers.map((url) => axios.get(url));
        const hotelData = await Promise.all(hotelPromises);

        const allHotels = hotelData.flatMap((data) => data.data);

        const merged = mergeHotelsData(allHotels, currentHotelsData);

        await fs.promises.writeFile(__dirname + hotelsDataFilePath, JSON.stringify(merged, null, 2));
        console.log("Merged hotels data written to file:", hotelsDataFilePath);
        return "Update data successfully"
    } catch (error) {
        throw new Error("Error writing merged hotels data:", error);
    }
};

const getAllHotels = () => {
    const hotelsData = require(__dirname + hotelsDataFilePath)

    return hotelsData
}

const getHotelById = (req) => {
    const hotelId = req.query.id
    if (!hotelId) {
        throw new Error("Missing hotel id")
    }
    const hotelsData = getAllHotels()
    if (hotelsData[hotelId]) {
        return hotelsData[hotelId]
    } else {
        throw new Error("Hotel id is invalid")
    }
}

const getHotelByDestinationId = (req) => {
    const destinationId = req.query.id
    if (!destinationId) {
        throw new Error("Missing destination Id")
    }
    const hotelsData = getAllHotels()

    for (const hotelId in hotelsData) {
        if (hotelsData[hotelId]["destination_id"] == parseInt(destinationId)) {
            return hotelsData[hotelId]
        }
    }
    throw new Error("Destination Id is invalid")
}



module.exports = { updatedHotelsData, getHotelById, getHotelByDestinationId, mergeHotelsData }