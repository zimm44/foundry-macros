//Activate Stealth and apply effects

//enable effects, requires Token Magic FX module
let effectsOn = true;

//edit if required, must be equal to character sheet
//stealth feature name
let featName = "Stealth";


//don't change anything from this point unless you are sure about what you're doing
//declarations
let actorData = canvas.tokens.controlled;
let featId = "ste";

//checks if Token Magic FX module is activated, if not then force deactivates effects to prevent errors
if (typeof TokenMagic == 'undefined')
    effectsOn = false;

function toChat(endMsg) {
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: endMsg
    };
    ChatMessage.create(chatData, {});
}

if (actorData.length == 1) { //if only one is selected
    
    actorData = actorData[0].actor;
    
    //check if Stealth is active
    if (actorData.data.flags.stealthRoll !== null && actorData.data.flags.stealthRoll !== undefined) {

        let skillCheck = actorData.data.flags.stealthRoll;

        let content = `<p>${actorData.name} ${featName} check was ${skillCheck}.</em></p>`;
        new Dialog({
            title: `${featName}`,
            content: content,      
            buttons: {     
                one: {
                    icon: '<i class="fas fa-user"></i>',                    
                    label: "Unhide",
                    callback: (html) =>               
                    {
                        let obj = {};
                        obj['flags.stealthRoll'] = null;
                        actorData.update(obj);               
                        if (effectsOn)
                            TokenMagic.deleteFiltersOnSelected();
                    }
                },
                two: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Show Roll",
                    callback: (html) =>               
                    {
                        let chatMsg = `<div class="dnd5e chat-card item-card"">${actorData.name} rolled ${skillCheck} for ${featName}.</div>`;
                        toChat(chatMsg);
                    }                    
                },
                three: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel"
                }                
            },
            default: "Cancel"
        }).render(true);

    } else {

        //use skill and update roll result to a flag
        async function main() {
            let roll = await actor.rollSkill(featId);
            if (roll) {
                let result = eval(roll.result);
                let obj = {};
                obj['flags.stealthRoll'] = result;
                actorData.update(obj);
                if (effectsOn) {
                    //add effects filter template with Tokenmagic module
                    let params =
                    [{
                        filterType: "fumes",
                        color: 0x909090,
                        time: 0,
                        blend: 1,
                        animated :
                        {
                            time : 
                            { 
                            active: true, 
                            speed: 0.0006, 
                            animType: "move" 
                            }
                        }
                    }];
                    TokenMagic.addFiltersOnSelected(params);
                }
            }   
        }
        main();
    }
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);