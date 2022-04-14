const core = require('./keto-diet-buddy-core.js');
const express = require("express");
const PORT = process.env.PORT || 8080;

const app = express();


app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());



app.get("/", (req, res) => {
    res.send("Keto analysis Api");
});



app.post("/calculate", async (req, res) => {
    console.log(req.body)
    gender = parseInt(req.body.gender)
    age =  parseInt(req.body.age)
    weight =  parseInt(req.body.weight)
    bodyfat =  parseInt(req.body.bodyfat)
    height =  parseInt(req.body.height)
    activityLevel =  parseInt(req.body.activityLevel)
    netCarbs =  parseInt(req.body.netCarbs)

    var exampleData = {
        gender: gender,
        age: age,
        weight: weight,
        bodyfat: bodyfat,
        height: height,
        activityLevel: activityLevel,
        netCarbs: netCarbs
    };
    var calorieAdjustment = -15;
    var kdb = new core.KetoDietBuddy(exampleData);
    var result = kdb.calculateCalorieIntake(calorieAdjustment);
    var bmr = `Calculated Basal Metabolic Rate (BMR): ${Math.round(kdb.bmr)} kcal`
    var textResult = JSON.stringify(result, null, 4);

    // console.log(textResult)

    var calorieAdjustment = (result.adjustment < 0) ? -result.adjustment + "% deficit" : result.adjustment + "% surplus";
    var warnings = []
    if ((result.warnings & core.Warnings.LOW_BODYFAT) == core.Warnings.LOW_BODYFAT) {
        warnings.push("Bodyfat too low");
    }
    if ((result.warnings & core.Warnings.LOW_CALORIES) == core.Warnings.LOW_CALORIES) {
        warnings.push("Calorie intake too low");
    }
    if ((result.warnings & core.Warnings.LOW_FATGRAMS) == core.Warnings.LOW_FATGRAMS) {
        warnings.push("Fat intake too low");
    }
    if ((result.warnings & core.Warnings.HIGH_CARBS) == core.Warnings.HIGH_CARBS) {
        warnings.push("Carb intake too high");
    }

    if (warnings.length == 0) {
        warnings.push("none -- all good");
    }


    function messageconstruct(data) {
        console.log(data)
        var energy = data.energy + " kcal";
        var macroGrams = data.gramsFat + "g, " + data.gramsProtein + "g, " + data.gramsNetCarbs + "g";
        var macroEnergy = data.energyFat + " kcal, " + data.energyProtein + " kcal, " + data.energyNetCarbs + " kcal";
        var macroPercEnergy = data.percEnergyFat + "%, " + data.percEnergyProtein + "%, " + data.percEnergyNetCarbs + "%";
        output = `Energy: ${energy}\nFat/ Protein/ Net Carbs grams: ${macroGrams}\nFat/ Protein/ Net Carbs energy: ${macroEnergy}\nFat/ Protein/ Net Carbs: ${macroPercEnergy}`
        return output
    }


    maintenance = messageconstruct(result.maintenance)
    minimum = messageconstruct(result.minimum)
    desirable = messageconstruct(result.desirable)
    console.log(maintenance, minimum, desirable)
    warnings = warnings.join()


    message = `${bmr}\n\nMinimum\n\n${minimum}\n\nMaintenance${maintenance}\n\nDesirable\n\n${desirable}\n\nWarnings: ${warnings}`
    console.log(message)
    res.send({message:message})

});


app.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});