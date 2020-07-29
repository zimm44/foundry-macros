//Use Bardic Inspiration and apply effects
//Select the bard then one target, it will automatically check for colleges and list appropriate Bardic Inpiration related skills

let confirmed = false;

//enable effects, requires Tokenmagic module
let effectsOn = true;

//edit if required, must be equal to character sheet
let actorData = canvas.tokens.controlled;

function bardSubclasses(subclassName,subclassTarget,subclassBardicDie,subclassPsychicBladesDie) {
    return [
        {source: "Bard", feat: "Bardic Inspiration", featlevel: 1, die: `${subclassBardicDie}`, roll: false, flavor: `${subclassTarget} was deeply inspires by ${subclassName}! Now it can use an Inspiration Bardic Die to increase one of the following:<br>- Ability Check<br>- Attack Roll<br>- Saving Throw`},
        {source: "College of Eloquence", feat: "Unsettling Words", featlevel: 3, die: `${subclassBardicDie}`, roll: true, flavor: `${subclassName} uses Unsettling Words to cause doubt on ${subclassTarget}.`},
        {source: "College of Glamour", feat: "Mantle of Inspiration", featlevel: 3, die: ``, roll: false, flavor: `${subclassName} uses Mantle of Inspiration to grant itself a wondrous appearance.`},
        {source: "College of Lore", feat: "Cutting Words", featlevel: 3, die: `${subclassBardicDie}`, roll: true, flavor: `${subclassName} uses Cutting Words to sap the confidence from ${subclassTarget}.`},
        {source: "College of Lore", feat: "Peerless Skill", featlevel: 14, die: `${subclassBardicDie}`, roll: true, flavor: `${subclassName} uses Peerless Skill to increases its confidence.`},
        {source: "College of Swords", feat: "Blade Flourish", featlevel: 3, die: `${subclassBardicDie}`, roll: true, flavor: `${subclassName} uses Blade Flourish to improve your own combat prowess.`},
        {source: "College of Valor", feat: "Combat Inspiration", featlevel: 3, die: `${subclassBardicDie}`, roll: false, flavor: `${subclassTarget} receives Combat Inspiration from ${subclassName} increasing its combat prowess! Now it can use an Inspiration Bardic Die to increase one of the following:<br>- Attack Damage<br>- Armor Class when attacked<br>- Ability Check<br>- Attack Roll<br>- Saving Throw`},
        {source: "College of Whispers", feat: "Psychic Blades", featlevel: 3, die: `${subclassPsychicBladesDie}`, roll: true, flavor: `${subclassName} uses Psychic Blades to imbue its weapon with power to magically intoxicate the mind of ${subclassTarget}.`}
    ];
}

let bardClassName = bardSubclasses()[0].source;
let featName = bardSubclasses()[0].feat;


function toChat(endMsg) {
    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: endMsg
    };
    ChatMessage.create(chatData, {});
}

function confirmUse(featSelectedName,actorData,featData,featBard) {

    let featSelectedData = duplicate(actorData.items.find(i => i.name===featSelectedName));
    let featUpdate = duplicate(featData);

    let content = `
    <p>
        <div class="form-group">
            <label>Flavor speech:</label>
            <input id="flavor" value="${featSelectedData.data.chatFlavor}"></input>
            <p>Input some extra flavor for your ${featSelectedName}!</p>
        </div>
    </p>
    `;

    new Dialog({
        title: `Using ${featSelectedName}`,
        content: content,
        buttons: {     
            one: {
                icon: '<i class="fas fa-music"></i>',
                label: "Do the thing!",
                callback: (html) =>               
                {                              
                    //button function
                    let bardicDieBonus = featBard.find(i => i.feat == featSelectedName).die;
                    let bardicDieText = "";
                    if (bardicDieBonus !== "")
                        bardicDieText = `<p>Bonus from Bardic Inspiration is ${bardicDieBonus}</p>`;

                    let chatMsg = `
                    <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}">
                        <header class="card-header flexrow">
                            <img src="${featSelectedData.img}" title="${featSelectedData.name}" width="36" height="36"/>
                            <h3 class="item-name">
                            ${featSelectedData.name}</h3>
                        </header>
                        <div class="card-content">
                            <strong>${html.find('#flavor')[0].value}</strong>
                            ${bardicDieText}
                            <p>${featBard.find(i => i.feat == featSelectedName).flavor}</p>
                            <details closed="">
                                <summary>Toggle description</summary>
                                ${featSelectedData.data.description.value}
                            </details>
                        </div>
                    </div>
                    `;                                              

                    if (featBard.find(i => i.feat == featSelectedName).roll) {
                        new Roll(`${bardicDieBonus}`).roll().toMessage({
                            speaker: ChatMessage.getSpeaker(),
                            flavor: chatMsg});                        
                    } else {
                        ChatMessage.create({
                            speaker: ChatMessage.getSpeaker(),
                            content: chatMsg
                        });
                    }


                    //update actor data
                    featUpdate.data.uses.value = featUpdate.data.uses.value - 1;
                    actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
                    featSelectedData.data.chatFlavor = html.find('#flavor')[0].value;
                    actorData.updateEmbeddedEntity("OwnedItem", featSelectedData);

                    if (effectsOn) {
                        //add effects filter template with Tokenmagic module
                        let params =
                        [{
                            filterType: "zoomblur",
                            autoDestroy: true,
                            strength: 0.3,
                            innerRadiusPercent: 70,
                            radiusPercent: 120,
                            padding: 30,
                            animated:
                            {
                                innerRadiusPercent: 
                                { 
                                active: true, 
                                animType: "sinOscillation", 
                                loopDuration: 500, 
                                val1: 65, 
                                val2: 75,
                                loops: 11
                                }
                            }
                        },
                        {
                            filterType: "glow",
                            autoDestroy: true,
                            distance: 10,
                            outerStrength: 8,
                            innerStrength: 0,
                            color: 0xFFFFFF,
                            quality: 0.5,
                            padding: 10,
                            animated:
                            {
                                color: 
                                {
                                active: true, 
                                loopDuration: 2770, 
                                animType: "colorOscillation", 
                                val1:0xFFFFFF, 
                                val2:0xFFDF00,
                                loops: 2
                                }
                            }    
                        }];                         
                        TokenMagic.addFiltersOnSelected(params);
                    }   

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

if (actorData.length == 1) { //if only one is selected
    actorData = actorData[0].actor;
    let featData = actorData ? actorData.items.find(i => i.name===featName) : null;
    let featClass = actorData ? actorData.items.find(i => i.name===bardClassName) : null;
    if (featData !== null && featClass !== null) { //if have the required class and feature
        if (game.user.targets.size == 1) { //if have one target
            if(featData.data.data.uses.value > 0) { //check if there are uses available              

                let bardLevel = featClass.data.data.levels;
                let bardSubclass = featClass.data.data.subclass;
                let maxUses = featData.data.data.uses.value;
                let targetActor = game.user.targets.values().next().value.actor;

                let bardicDie = "1d6";
                let psychicBladesDie = "2d6";
                if (bardLevel >= 15) {
                    bardicDie = "1d12";
                    psychicBladesDie = "8d6";
                } else if (bardLevel >= 10) {
                    bardicDie = "1d10";
                    psychicBladesDie = "5d6";
                } else if (bardLevel >= 5) {
                    bardicDie = "1d8";
                    psychicBladesDie = "3d6";
                }

                let featBard = bardSubclasses(actorData.name,targetActor.data.name,bardicDie,psychicBladesDie).filter(i => (i.source == bardClassName || i.source == bardSubclass) && i.featlevel <= bardLevel);
                
                let content = `<form><div class="form-group">
                                <label>Inspiration feature:</label>
                                <select id="feature-name">`;
                featBard.forEach(feats => {
                    content += `<option value="${feats.feat}">${feats.feat}</option>`;
                });
                
                content += `</select></div></form>
                            <p><strong>You have ${maxUses} uses remaining before resting.</strong></p>`;

                new Dialog({
                    title: `${featName}`,
                    content: content,      
                    buttons: {     
                        one: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Continue",
                            callback: (html) =>               
                            {                              
                                confirmed = true;
                            }
                        },
                        two: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Cancel"
                        }  
                    },
                    default: "Cancel",
                    close: html => {
                        if (confirmed) {
                            confirmUse(html.find('#feature-name')[0].value,actorData,featData,featBard);
                        }
                    }
                }).render(true);            
            } else
                ui.notifications.warn(`${actorData.name} does not have any uses of ${featName} left.`);
        } else if (game.user.targets.size > 1)
            ui.notifications.warn(`Target only one token.`);
        else
            ui.notifications.warn(`Target one token. Double right-click if you're a player or single right-click then select target if you're GM. If the feature is centered on you and have more than one target, target yourself.`);
    } else
        ui.notifications.warn(`Selected character must be a ${bardClassName} and have ${featName} feature.`);
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);