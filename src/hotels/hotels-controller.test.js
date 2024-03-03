const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { updatedHotelsData, getAllHotels, getHotelById, getHotelByDestinationId } = require("./hotels-controller");

jest.mock("axios");

const mockMergedHotelsDataPath = "/__mocks__/mock-merged-hotel-data.json";
const mockSuppliersDataPath = "/__mocks__/mock-suppliers";
const mockHotelsData = require("./__mocks__/mock-hotels-data.json");
const mockMergedHotelsData = require("./__mocks__/mock-merged-hotel-data.json");

beforeEach(() => {
	axios.get.mockResolvedValueOnce({ data: mockHotelsData });
});

describe("Hotels data access functions", () => {
	test("getAllHotels should read hotels data from file", async () => {
		const hotels = await getAllHotels(fs, mockMergedHotelsDataPath);

		expect(hotels).toEqual(mockMergedHotelsData);
	});

	test("getHotelById should return hotel data for valid ID", () => {
		const hotelId = "iJhz";
		const req = { query: { id: hotelId } };

		const hotel = getHotelById(mockMergedHotelsData, req);

		expect(hotel).toEqual(mockMergedHotelsData["iJhz"]);
	});

	test("getHotelById should throw error for missing ID", () => {
		const req = { query: {} };

		expect(() => getHotelById(mockMergedHotelsData, req)).toThrow("Missing hotel id");
	});

	test("getHotelById should throw an error if hotel id is invalid", () => {
		req = { query: { id: "invalid id" } };
		expect(() => getHotelById(mockMergedHotelsData, req)).toThrow("Hotel id is invalid");
	});

	test("getHotelByDestinationId should thorw an error if destination id is valid", () => {
		req = { query: { id: 5432 } };
		const hotel = getHotelByDestinationId(mockMergedHotelsData, req);
		expect(hotel).toEqual(mockMergedHotelsData["iJhz"]);
	});

	test("getHotelByDestinationId should throw error for missing ID", () => {
		const req = { query: {} };

		expect(() => getHotelByDestinationId(mockMergedHotelsData, req)).toThrow("Missing destination Id");
	});

	test("getHotelById should throw an error if destination id is invalid", () => {
		req = { query: { id: "invalid id" } };
		expect(() => getHotelByDestinationId(mockMergedHotelsData, req)).toThrow("Destination Id is invalid");
	});
});

describe("Updated hotels data function", () => {
	test("updatedHotelsData should fetch data, merge it, write to file, and return merged data", async () => {
		const updatedData = await updatedHotelsData(mockMergedHotelsDataPath, mockSuppliersDataPath, fs, axios);
		expect(axios.get).toHaveBeenCalledWith("https://example.com/hotels");
		expect(JSON.stringify(updatedData)).toEqual(JSON.stringify(mockMergedHotelsData)); // Assert based on mock data
	});
});

