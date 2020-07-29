//Delete owned or all templates in the current scene

function confirmDelete() {
    if (game.user.isGM === true) {
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
    } else {
        return ui.notifications.error(`This option is available only for users with GM permissions.`);
    }
}

new Dialog({
    title: "Delete templates",
    content: `
    <p>Which templates do you want do clear?</p>       
    `,
    buttons: {
    one: {
        icon: '<i class="fas fa-user"></i>',
        label: "My templates",
        callback: (html) =>
        {
            //Delete only user templates
            canvas.templates.deleteMany(canvas.templates.placeables.filter(i =>i.data.user == game.user.id).map(o =>o.id),{});
        }
    },
    two: {
        icon: '<i class="fas fa-eraser"></i>',
        label: "GM only: All",
        callback: (html) =>
        {
            confirmDelete();
        }
    },
    three: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
    }                
    },
    default: "Cancel"
}).render(true);
