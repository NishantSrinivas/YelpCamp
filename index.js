const express = require("express");
const app = express();
const path = require("path");
const Camp = require("./models/camps");
const methodOverride = require('method-override');
const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');
// .then(() => {
//     console.log("CONNECTION WITH DATABASE DONE!");
// })
// .catch(err => {
//     console.log("FAILED CONNECTION WITH DATABASE");
//     console.log(err);
// });

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

app.post("/camp/add", async (req, res) => {
    const camp = Camp({
        "price": req.body.price,
        "title": req.body.title,
        "location": req.body.location,
        "description": req.body.description
    });

    await camp.save();
    res.redirect("/allcamps");
});

app.post("/camp/newcamp", (req, res) => {
    res.render("new");
});

app.delete("/camp/:id", async (req, res) => {
    await Camp.findByIdAndDelete(req.params.id);
    res.redirect("/allcamps");
});

app.delete("/allcamps", async (req, res) => {
    await Camp.deleteMany({});
    res.redirect("/");
});

app.patch("/camp/:id", async (req, res) => {
    const camp_with_id = await Camp.findById(req.params.id);
    res.render("edit", { camp_with_id });
});

app.patch("/camp/updateprice/:id", async (req, res) => {
    await Camp.findByIdAndUpdate(req.params.id, { "price": req.body.price });
    res.redirect("/allcamps");
});

app.listen(8000, () => {
    console.log("Yelp camp activated on port 8000");
});