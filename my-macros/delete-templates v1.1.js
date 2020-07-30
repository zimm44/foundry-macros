//Delete owned or all templates in the current scene

//declarations
let typeLabel = "";
let typeText = "";
let buttons = {};
let checkGM = false;

function confirmDelete() {
    new Dialog({
        title: "Delete templates",
        content: `
        <p>Are you sure you want to clear all templates?</p>       
        `,
        buttons: {
        one: {
            icon: '<i class="fas fa-eraser"></i>',
            label: "Yes",
            callback: (html) =>
            {
                //Delete all templates
                canvas.templates.deleteMany(canvas.templates.placeables.map(o =>o.id),{});
            }
        },
        two: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
        }                
        },
        default: "Cancel"
    }).render(true);
}

if (game.user.isGM === true) {
    typeLabel = "My templates";
    typeText = "Which templates do you want do clear?";
    checkGM = true;
} else {
    typeLabel = "Clear";
    typeText = "Are you sure you want to clear your templates?";
}


buttons['deletePlayerButton'] = {
    icon: '<i class="fas fa-eraser"></i>',
    label: `${typeLabel}`,
    callback: (html) =>
    {
        //delete only user templates
        canvas.templates.deleteMany(canvas.templates.placeables.filter(i =>i.data.user == game.user.id).map(o =>o.id),{});
    }
}

if (checkGM) {
    buttons['deleteGMButton'] = {
        icon: '<i class="fas fa-eraser"></i>',
        label: "All templates",
        callback: (html) =>
        {
            //delete all templates - GM only
            confirmDelete();
        }
    };
}   

buttons['cancelButton'] = {
    icon: '<i class="fas fa-times"></i>',
    label: "Cancel"
}    

new Dialog({
    title: "Delete templates",
    content: `
    <p>${typeText}</p>       
    `,
    buttons: buttons,
    default: "Cancel"
}).render(true);