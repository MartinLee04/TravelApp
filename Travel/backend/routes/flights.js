// backend/routes/flights.js
import express from 'express';
import Amadeus from 'amadeus';

const router = express.Router();

const amadeus = new Amadeus({
  clientId: 'GuR8pZSdQ2AWC8mfwAVbOmC8CfST4DLZ',
  clientSecret: '6l8Oyq3iIs2vFSuo'
});

// Get flight information
router.post('/search-flights', async (req, res) => {
  try {
    const { originCode, destinationCode, departureDate, returnDate, maxPrice, currency, cabin, adults } = req.body;

    // Always use round trip format with both departure and return
    const originDestinations = [
      {
        id: '1',
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDateTimeRange: { date: departureDate },
      },
      {
        id: '2',
        originLocationCode: destinationCode,
        destinationLocationCode: originCode,
        departureDateTimeRange: { date: returnDate },
      }
    ];

    console.log("Constructed originDestinations:", JSON.stringify(originDestinations, null, 2)); // Debugging log

    const requestBody = {
      currencyCode: currency,
      originDestinations: originDestinations,
      travelers: Array.from({ length: adults }, (_, i) => ({
        id: `${i + 1}`,
        travelerType: 'ADULT',
      })),
      sources: ['GDS'],
      maxPrice: maxPrice,
      searchCriteria: {
        maxFlightOffers: 100,
        flightFilters: {
          cabinRestrictions: [
            {
              cabin: cabin,
              coverage: "ALL_SEGMENTS",
              originDestinationIds: ["1"],
            },
          ],
        }
      }
    };

    console.log("Request body for Amadeus API:", JSON.stringify(requestBody, null, 2)); // Debugging log

    const response = await amadeus.shopping.flightOffersSearch.post(
      JSON.stringify(requestBody),
      { 'X-HTTP-Method-Override': 'GET' } // Required header for POST requests
    );
    let uniqueFlights = [];
    let prevPrice = 0;
    let flights = response.data
    for (let i=0; i< flights.length;i++) {

      if (flights[i].price.total !== prevPrice) {
        uniqueFlights.push(flights[i]);
        prevPrice = flights[i].price.total
      }
    }
    console.log("Unique flights:", uniqueFlights); // Debugging log
    res.json(uniqueFlights);
  } catch (error) {
    console.error('Amadeus API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'An error occurred while fetching flight data' });
  }
});


router.post('/search-flights-recommendations', async (req, res) => {
  try {
    const { originCode, destinationCode, departureDate, returnDate, maxPrice, cabin, currency, adults } = req.body;

    const requestBody = {
      currencyCode: currency,
      originDestinations: [
        {
          id: '1',
          originLocationCode: originCode,
          destinationLocationCode: destinationCode,
          departureDateTimeRange: { date: departureDate },
        }
      ],
      //
      travelers: Array.from({ length: adults }, (_, i) => ({
        id: `${i + 1}`,
        travelerType: 'ADULT',
      })),
      sources: ['GDS'],
      maxPrice: maxPrice,
      searchCriteria: {
        maxFlightOffers: 1,
        // flightFilters: {
        //   cabinRestrictions: [
        //     {
        //       cabin: cabin,
        //       coverage: "ALL_SEGMENTS",
        //       originDestinationIds: ["1"],
        //     },
        //   ],
        // }
      }
    };

    const response = await amadeus.shopping.flightOffersSearch.post(
      JSON.stringify(requestBody),
      { 'X-HTTP-Method-Override': 'GET' } // Required header for POST requests
    );
    let uniqueFlights = [];
    let prevPrice = 0;
    let flights = response.data
    for (let i=0; i< flights.length;i++) {

      if (flights[i].price.total !== prevPrice) {
        uniqueFlights.push(flights[i]);
        prevPrice = flights[i].price.total
      }
    }
    console.log(uniqueFlights)
    res.json(uniqueFlights);
  } catch (error) {
    console.error('Amadeus API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'An error occurred while fetching flight data' });
  }
});


// Get destination name by airport code
router.post('/search-city', async (req, res) => {
  try {
    const { airportCode } = req.body;
    if (!airportCode || typeof airportCode !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing airportCode' });
    }
    const response = await amadeus.referenceData.locations.get({
      keyword: airportCode,
      subType: 'CITY,AIRPORT',
      max: 1,
    });
    if (response.data && response.data.length > 0 && response.data[0].address) {
      const cityName = response.data[0].address.cityName;
      res.json({ cityName });
    } else {
      res.status(404).json({ error: 'City not found' });
    }
  } catch (error) {
    console.error('Error fetching city data:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch city data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
