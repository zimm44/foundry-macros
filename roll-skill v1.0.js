//Roll Skill check for an Actor

let actorData = canvas.tokens.controlled;

if (actorData.length == 1) { //if only one is selected
    actorData = actorData[0].actor;
    new Dialog({
        title: "Select Skill",
        content: getCheckTemplate(),
        buttons: {
        one: {
            icon: '<i class="fas fa-check"></i>',
            label: "Confirm",
            callback: (html) =>
            {
                const sourceSkillName = html.find("#skillName")[0].value;
                actorData.rollSkill(sourceSkillName);
            }
        },
        two: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
        }
        },
        default: "Cancel"
    }).render(true);
    
    function getCheckTemplate() {
        let objects = new Object();
        objects = game.dnd5e.config.skills;

        let template = `
        <form>
            <div class="form-group">
                <label>Skill:</label>
                <select id="skillName">`
        
                for (let [checkId, check] of Object.entries(objects)) {
                    template += `<option value="${checkId}">${check}</option>`;    
                }            
        
        template += `</select>
            </div>
        </form>`;

        return template;
    }
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);