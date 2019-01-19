function computeInsights() {
    let insights = [];

    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };

    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };

    let failedGrades = [];
    let allGrades = app.magister.grades.slice(0);
    allGrades.reverse();

    let validGrades = [];
    let validGradesRaw = [];

    for (let i = 0; i < allGrades.length; i++) {
        const element = allGrades[i];
        var parsedGrade = app.magister.parseGrade(element);
        if (parsedGrade != undefined) {
            if (parsedGrade < 5.5) {
                failedGrades.push(parsedGrade);
            }

            validGrades.push(parsedGrade);
            validGradesRaw.push(element);
        }
    }

    insights.push({
        name: "Je hoogste cijfer was een " +
        app.magister.gradeToString(validGrades.max())  + ".",

        icon: "fas fa-star",
        colors: {
            bg: "rgb(65, 244, 223)",
            fg: "rgb(65, 133, 244)"
        }
    });

    insights.push({
        name: "Je laagste cijfer was een " +
        app.magister.gradeToString(validGrades.min()) + ".",

        icon: "fas fa-angle-double-down",
        colors: {
            bg: "red",
            fg: "white"
        }
    });

    insights.push({
        name: "Je hebt dit jaar " +
        failedGrades.length + ` onvoldoende${failedGrades.length > 1 ? "s" : ""} gehaald.`,

        icon: null,
        colors: {}
    });

    return insights;
}
