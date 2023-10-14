const express = require("express");
const app = express();
const path = require("path");
const Camp = require("./models/camps");
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const errorHandle = require("./error_utils/ErrorHandle");
const handleAsync = require("./error_utils/HandleAsync");
const validCamp = require("./error_utils/JoiValidation");
const ErrorHandle = require("./error_utils/ErrorHandle");

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Connected to Yelp Database");
});

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const validateCamp = (req, res, next) => {
    const { error } = validCamp.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(",");
        throw new ErrorHandle(400, msg);
    }
    return next();
}

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/camp/newcamp", (req, res) => {
    res.render("new");
});

app.get("/camp/:id", handleAsync(async (req, res, next) => {
    const camp_with_id = await Camp.findById(req.params.id);
    res.render("camp", { camp_with_id });
}));

app.get("/allcamps", async (req, res, next) => {
    try {
        const allcamps = await Camp.find({});
        res.render("all", { allcamps });
    } catch {
        return next(new errorHandle(500, "Could not find all camps"));
    }
});

app.post("/camp/add", validateCamp, handleAsync(async (req, res, next) => {
    const camp = Camp({
        "price": req.body.price,
        "title": req.body.title,
        "location": req.body.location,
        "description": req.body.description,
        "image": req.body.image
    });
    await camp.save();
    res.redirect("/allcamps");
}));

app.delete("/camp/:id", handleAsync(async (req, res, next) => {
    await Camp.findByIdAndDelete(req.params.id);
    res.redirect("/allcamps");
}));

app.delete("/allcamps", handleAsync(async (req, res, next) => {
    await Camp.deleteMany({});
    res.redirect("/");
}));

app.patch("/camp/:id", handleAsync(async (req, res, next) => {
    const camp_with_id = await Camp.findById(req.params.id);
    res.render("edit", { camp_with_id });
}));

app.patch("/camp/update/:id", validateCamp, handleAsync(async (req, res, next) => {
    await Camp.findByIdAndUpdate(req.params.id, { "title": req.body.title, "location": req.body.location, "description": req.body.description, "price": req.body.price, "image": req.body.image });
    res.redirect("/allcamps");
}));

app.use((req, res) => {
    res.status(404).render("notfound");
});

// Basic error handling
app.use((err, req, res, next) => {
    const { status = 500, message = "OH NO! THIS SHOULD NOT HAVE HAPPENED" } = err;
    res.status(status).render("error", { message });
});

app.listen(8000, () => {
    console.log("Yelp camp activated on port 8000");
});