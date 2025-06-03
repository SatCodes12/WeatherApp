import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const api_key = process.env.API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/", async (req, res) => {
    const city = req.body.city;
    try {
        const response = await axios.get(API_URL, {
            params: {
                q: city,
                appid: api_key,
                units: "metric"
            }
        });
        console.log(response.data);

        const formattedTimes = convertToLocalTimes(response.data.coord.lat, response.data.coord.lon, response.data.dt, response.data.sys.sunrise, response.data.sys.sunset);
        console.log(formattedTimes);

        res.render("index.ejs", { weatherData: response.data, timeData: formattedTimes, error: null });
    } catch (error) {
        console.log(error);
        res.render("index.ejs", { weatherData: null, timeData: null, error: "Something went wrong!!" });
    }
});

function convertToLocalTimes(latitude, longitude, currentTime, sunrise, sunset) {
    const time_zone = tzlookup(latitude, longitude);

    return {
        date: DateTime.fromSeconds(currentTime).setZone(time_zone).toFormat("dd/MM/yyyy"),
        currentTime: DateTime.fromSeconds(currentTime).setZone(time_zone).toFormat("HH:mm"),
        sunrise: DateTime.fromSeconds(sunrise).setZone(time_zone).toFormat("HH:mm"),
        sunset: DateTime.fromSeconds(sunset).setZone(time_zone).toFormat("HH:mm"),
        timeZone: time_zone
    };
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});