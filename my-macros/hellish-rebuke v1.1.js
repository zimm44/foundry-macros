//Conjures Hellish Rebuke
//Requires a token with the feature, checks if Innate Magic is available as well.

//enable effects, requires Token Magic FX module
let effectsOn = true;

//edit if required, must be equal to character sheet
//hellish rebucke feature name
let featName = "Hellish Rebuke";


//don't change anything from this point unless you are sure about what you're doing
//declarations
let actorData = canvas.tokens.controlled;
let pactCast = false;
let innateCast = false;
let confirmed = false;
let dmgPact = "";
let dmgInnate = "";
let featDmg = "d10";

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
    let featDataInnate = actorData ? actorData.items.find(i => i.name===featName && i.data.data.preparation.mode==="innate") : null;
    let featData = actorData ? actorData.items.find(i => i.name===featName && i.data.data.preparation.mode!=="innate") : null;
    let featDataInnateUses = 0;
    let featDataUses = 0;

    if (featData !== null || featDataInnate !== null) { //if have the required feature

        //verify pact and innate magic existance, calculate damage for each type of magic, check number os uses left and prepare dialog content
        let content = `<p>Preparing to cast ${featName}. You can cast it as:</p>`;
        let count = 0;
        if (featData !== null) {
            featDataUses = actorData.data.data.spells.pact.value;
            if (actorData.data.data.spells.pact.level-1 > 0) {
                dmgPact = `${featData.data.data.damage.parts[0][0]}+${actorData.data.data.spells.pact.level-1}${featDmg}`;
            } else {
                dmgPact = `${featData.data.data.damage.parts[0][0]}`;
            }
            content += `<p><li>Pact Magic (${featDataUses} left) for ${dmgPact} damage</li></p>`;
            count++;
        } else {
            
        }
        if (featDataInnate !== null) {
            featDataInnateUses = featDataInnate.data.data.uses.value;
            dmgInnate = featDataInnate.data.data.damage.parts[0][0];
            content += `<p><li>Innate Magic (${featDataInnateUses} left) for ${dmgInnate} damage</li></p>`;
            count++;
        } else {
            
        }
        if (count == 2) {
            content += `<p>Which one do you want to use?</p>`;
        }
        
        if(featDataUses > 0 || featDataInnateUses > 0) { //check if there are uses available              
            let buttons = {};

            if (featData !== null) {
                buttons['pactButton'] = {
                    label: `Pact Magic`,
                    callback: (html) =>               
                    {
                        if (featDataUses > 0) {
                            //consume pact spell uses

                            //prepare chat content
                            let pactMagicUses = actorData;
                            pactMagicUses.data.data.spells.pact.value = actorData.data.data.spells.pact.value - 1;
                            actorData.updateEmbeddedEntity("OwnedItem", pactMagicUses);
                            

                            let chatMsg = `
                            <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}">
                                <header class="card-header flexrow">
                                    <img src="${featData.img}" title="${featName}" width="36" height="36"/>
                                    <h3 class="item-name">
                                    ${featName}</h3>
                                </header>
                                <div class="card-content">
                                    <p>${actorData.name} uses ${featName}.</p>
                                    <details closed="">
                                    <summary>Toggle description</summary>
                                    ${featData.data.data.description.value}
                                    </details>
                                </div>
                            </div>
                            `;      

                            //roll dice
                            new Roll(`${dmgPact}`).roll().toMessage({
                                speaker: ChatMessage.getSpeaker(),
                                flavor: chatMsg});
                            
                            confirmed = true;

                        } else
                            ui.notifications.warn(`${actorData.name} does not have any Pact Magic uses of ${featName} left. Use Innate Magic instead.`);
                    }
                };
            }

            if (featDataInnate !== null) {
                buttons['innateButton'] = {
                    label: "Innate Magic",
                    callback: (html) =>               
                    {
                        if (featDataInnateUses > 0) {
                            //consume innate spell uses

                            //prepare chat content
                            let featDataInnateConsume = duplicate(featDataInnate);
                            featDataInnateConsume.data.uses.value = featDataInnateConsume.data.uses.value - 1;
                            actorData.updateEmbeddedEntity("OwnedItem", featDataInnateConsume);
                            
                            let chatMsg = `
                            <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}">
                                <header class="card-header flexrow">
                                    <img src="${featDataInnate.img}" title="${featName}" width="36" height="36"/>
                                    <h3 class="item-name">
                                    ${featName}</h3>
                                </header>
                                <div class="card-content">
                                    <p>${actorData.name} uses ${featName}.</p>
                                    <details closed="">
                                    <summary>Toggle description</summary>
                                    ${featDataInnate.data.data.description.value}
                                    </details>
                                </div>
                            </div>
                            `;                    

                            //roll dice
                            new Roll(`${dmgInnate}`).roll().toMessage({
                                speaker: ChatMessage.getSpeaker(),
                                flavor: chatMsg});
                            
                            confirmed = true;

                        } else
                            ui.notifications.warn(`${actorData.name} does not have any Innate Magic uses of ${featName} left. Use Pact Magic instead.`);
                    }                            
                };
            }                

            buttons['cancelButton'] = {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            }                    

            new Dialog({
                title: `Using ${featName}`,
                content: content,      
                buttons: buttons,
                default: "Cancel",
                close: html => {
                    if (effectsOn && confirmed) {
                        //add effects filter template with Tokenmagic module
                        let params =
                        [{
                            filterType: "distortion",
                            maskPath: "/modules/tokenmagic/fx/assets/waves-2.png",
                            maskSpriteScaleX: 7,
                            maskSpriteScaleY: 7,
                            padding: 50,
                            autoDestroy: true,
                            animated:
                            {
                                maskSpriteX: { active: true, speed: 0.05, animType: "move", loops: 2 },
                                maskSpriteY: { active: true, speed: 0.07, animType: "move", loops: 2 }
                            }
                        },
                        {
                            filterType: "glow",
                            distance: 10,
                            outerStrength: 8,
                            innerStrength: 0,
                            color: 0xB03000,
                            quality: 0.5,
                            autoDestroy: true,
                            animated:
                            {
                                color: 
                                {
                                    active: true, 
                                    loopDuration: 3000, 
                                    animType: "colorOscillation", 
                                    val1:0xB03000, 
                                    val2:0xFFD010,
                                    loops: 3
                                }
                            }
                        }
                        ];                               
                        TokenMagic.addFiltersOnSelected(params);
                    }
                }
            }).render(true);            
        } else
            ui.notifications.warn(`${actorData.name} does not have any uses of ${featName} left.`);
    } else
        ui.notifications.warn(`Selected character must have ${featName} feature.`);
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);