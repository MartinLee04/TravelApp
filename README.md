# Travel App

This is a personal extension of a group project

This project hosts a travel recommendations and blog application that serves user relevant information and features that help determine potential travel locations. The application hosts a wide range of features from travel recommendation filters, a personalized profile function, blog posts for reviews and feedback, current flight prices to and from different cities across the world, and personalized recommendations

## Current Features

A basic web application (with 6 unique pages + Landing) including:
- Landing (Home Page)
- About Us
- Blog
- Search / Filter
- Login Page
- Register Page

Blog Post features:
- Currently allows blog post inputs and response
- Workflow is connected to the backend to store posts content, user id, name, location data, and post data.
- Currently shows all posts ordered by recency
- Data can be filtered by city, allowing users to see relevant reviews to their planned trip
- Blog posts show score and poster id
- Blog posts are stored and connected with the user profile

Search / Filter:
- Connected to a backend SQL database
- Filter and search options include: price, safety rating, country, continent, language
- Countries and cities are filtered as new criteria is added
- Added dropdown filters for country and safety score, along with a price range slider to refine search results dynamically
- Used React state to manage user selections and dynamically filter data

Search:
- Connected to live flight API: Amadeus
- Provides latest flight data based on user requests (location, travel dates, preferred currency)
- Returns all flight cards that correspond to user requests
- Users can store preferred flights into their profile backend to be viewed later

Backend (SQL):
- The current backend MySQL database hosts 4 tables for user accounts, travel destinations, saved flights and blog posts.
- The ‘Countries’ table contains all of the travel location information, including daily cost, safety rating, country, continent, languages spoken, temperature and primary industry. This - 
  information is served to the search and filter functions.
- The ‘Users’ table contains all of the temporary sign in information, including account name and password, first name, last name, email, phone number and languages spoken. This workflow 
   will be connected to firebase for authentication.
- The last table hosts all of the blog post information and is currently being constructed.

Recommendations:
- Connected the feature to a standard MySQL database that contains user profile and flight history
- Created an algorithm that utilizes user’s data to provide each travel plans a score based on how well it fits individual users
- The algorithm comprises several layers that are used in the search/filter feature including temperature and safety score
- Picks the top three travel plans with highest scores to be displayed to the user