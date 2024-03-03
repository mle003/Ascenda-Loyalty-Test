async function readHotelsData(fs, dataFilePath) {
    try {
        await fs.promises.access(__dirname + dataFilePath, fs.constants.F_OK);
        let hotelsData = await fs.promises.readFile(__dirname + dataFilePath, "utf-8");
        return JSON.parse(hotelsData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File does not exist');
            return {};
        } else {
            throw new Error(`Error reading hotels data: ${error}`);
        }
    }
}

async function writeHotelsData(fs, dataFilePath, data) {
	try {
		await fs.promises.writeFile(__dirname + dataFilePath, JSON.stringify(data, null, 2));
	} catch (error) {
		throw new Error(`Error writing hotels data: ${error}`);
	}
}

function mergeHotelsData (hotels, currentData) {
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
        currentData[id]["images"]["room"] = (currentData[id]["images"]["room"] || {})
        const room_images = (
            hotel.images?.rooms ||
            []
        )
        
        for(let image of room_images) {
            let description = (image.description || image.caption)
            let url = (image.url || image.link)
            if(!currentData[id]["images"]["room"][description]) {
                currentData[id]["images"]["room"][description] = []
            }
            if(!currentData[id]["images"]["room"][description].includes(url)) {
                currentData[id]["images"]["room"][description].push(url)
            }
            
        }

        currentData[id]["images"]["sites"] = (currentData[id]["images"]["sites"] || {})
        const sites_images = (
            hotel.images?.site ||
            []
        )
        for (let image of sites_images) {
            let description = (image.description || image.caption)
            let url = (image.url || image.link)
            if(!currentData[id]["images"]["sites"][description]) {
                currentData[id]["images"]["sites"][description] = []
            }
            if(!currentData[id]["images"]["sites"][description].includes(url)) {
                currentData[id]["images"]["sites"][description].push(url)
            }
        }

        currentData[id]["images"]["amenities"] = (currentData[id]["images"]["amenities"] || {})
        const amenities_images = (
            hotel.images?.amenities ||
            []
        )
        for (let image of amenities_images) {
            let description = (image.description || image.caption)
            let url = (image.url || image.link)
            if(!currentData[id]["images"]["amenities"][description]) {
                currentData[id]["images"]["amenities"][description] = []
            }
            if(!currentData[id]["images"]["amenities"][description].includes(url)) {
                currentData[id]["images"]["amenities"][description].push(url)
            }
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

async function fetchHotelsDataFromSuppliers(axios, suppliers) {
	const hotelPromises = suppliers.map((url) => axios.get(url));
	const hotelData = await Promise.all(hotelPromises);

	return hotelData.flatMap((data) => data.data);
}

async function updatedHotelsData(dataFilePath, suppliersDataFilePath, fs, axios) {
	const currentHotelsData = await readHotelsData(fs, dataFilePath);
	const suppliers = require(__dirname + suppliersDataFilePath);

	const allHotels = await fetchHotelsDataFromSuppliers(axios, suppliers);
	const mergedData = mergeHotelsData(allHotels, currentHotelsData);

	await writeHotelsData(fs, dataFilePath,  mergedData);
	console.log("Merged hotels data written to file:", dataFilePath);

	return mergedData;
}

function getAllHotels(fs, dataFilePath) {
	return readHotelsData(fs, dataFilePath);
}

function getHotelById(hotelsData, req) {
	const hotelId = req.query.id;
	if (!hotelId) {
		throw new Error("Missing hotel id");
	}
	if (!hotelsData[hotelId]) {
		throw new Error("Hotel id is invalid");
	}
	return hotelsData[hotelId];
}

function getHotelByDestinationId(hotelsData, req) {
	const destinationId = req.query.id;
	if (!destinationId) {
		throw new Error("Missing destination Id");
	}

	for (const hotelId in hotelsData) {
		if (hotelsData[hotelId]["destination_id"] == parseInt(destinationId)) {
			return hotelsData[hotelId];
		}
	}
	throw new Error("Destination Id is invalid");
}

module.exports = {
	updatedHotelsData,
	getAllHotels,
	getHotelById,
	getHotelByDestinationId,
};
