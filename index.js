const express = require("express");
const app = express();
const path = require("path");
const Camp = require("./models/camps");
const methodOverride = require('method-override');
const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log("CONNECTION WITH DATABASE DONE!");
    })
    .catch(err => {
        console.log("FAILED CONNECTION WITH DATABASE");
        console.log(err);
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Connected to Yelp Database");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/camp/:id", async (req, res) => {
    const campId = req.params.id;

    const camp_with_id = await Camp.findById(campId);
    res.render("camp", { camp_with_id });
});

app.get("/allcamps", async (req, res) => {
    const allcamps = await Camp.find({});
    res.render("all", { allcamps });
});

app.post("/camp/newcamp", async (req, res) => {
    quer = req.query;
    // _price = parseInt(quer.price,10)

    const camp = Camp({
        "price": quer.price,
        "title": quer.title,
        "location": quer.location,
        "description": quer.description
    });

    const result = await camp.save();
    res.send(result);
});

app.listen(8000, () => {
    console.log("Yelp camp activated on port 8000");
});