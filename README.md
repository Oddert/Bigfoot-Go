# Bigfoot Go
*The game where you hunt AI-interpreted Bigfoot sightings in your local area.*

## About the Project
This Pokemon-Go inspired game was created by Robyn Veitch, Anna Horne, and Caroline Sauter for the NatWest PICoE Away Day 2023.

The game uses the official* dataset of Bigfoot sightings to generate fake datasets scaled around the player.

Explore your local area, investigate potential sightings, and send your results to your local Bigfoot Hunters Chapter!

\* I don't know what constitutes an "official" encounter vs an alleged encounter and I didn't want to ask.

## To View
### Install the repository.
```bash
git clone https://github.com/Oddert/Bigfoot-Go.git
cd Bigfoot-Go
npm i
```
### Create a .env file
```bash
cp .env.example .env
```
Open `.env` and replace SESSION_SECRET with your own random value.

At this point you can run the development server, the production server, or one of the utility commands.

### Development server
Used to run the server in watch mode along with SASS and Parcel.
```bash
npm run dev
```

### Production server
Used to run the server in production mode.
```bash
npm start
```

### Utility Commands
Inside `src/utils/` there are utility commands to convert a given set of coordinates, assumed to be centred on the geographical centre of the United States, to a given set of coordinates, and scale.

- centerCoordinatesOnPlayer Provides a utility function for transforming a given set of plot points from one location and scale to another.
- convertCoordinatesToRelativePoint Utilises the above to convert a file and write its result. NOTE that this is not needed for the production server any more as its easier to convert at point of request.