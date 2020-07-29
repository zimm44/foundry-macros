//Cast Vicious Mockery on target and bring flavor from a table.

let confirmed = false;

//enable effects, requires Tokenmagic module
let effectsOn = true;

//edit if required, must be equal to character sheet
let featName = "Vicious Mockery";
let featTableName = "Mockeries";
let featAbilitySave = "cha";
let actorData = canvas.tokens.controlled;

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
    let featData = actorData ? actorData.items.find(i => i.name===featName) : null;
    if (featData !== null) { //if have the required feature
        if (game.user.targets.size == 1) { //if have one target
            let featUpdate = duplicate(featData);
            let targetActor = game.user.targets.values().next().value.actor;
            let maxUses = featUpdate.data.uses.value;
            let bardLevel = actorData.data.data.details.level;

            let content = `<p><em>${actorData.name} is sending subtle enchantment insults to ${targetActor.data.name}.</em></p>
                            <form>
                                <div class="form-group">
                                    <label for="flavor">Flavor speech:</label>
                                    <input id="flavor" name="flavor" value="${featUpdate.data.chatFlavor}"></input>
                                </div>
                            </form>
                            <p>Leaving in blank will roll from table '${featTableName}'.</p>
                            `;
            new Dialog({
                title: `${featName}`,
                content: content,      
                buttons: {     
                    one: {
                        icon: '<i class="fas fa-music"></i>',
                        label: "Mock!",
                        callback: (html) =>
                        {
                            confirmed = true;
                        }
                    },
                    three: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel"
                    }  
                },
                default: "Cancel",
                close: html => {
                    if (confirmed) {

                        async function main() {

                            let featFlavor = html.find('#flavor')[0].value;
                            featUpdate.data.chatFlavor = featFlavor;

                            if (featFlavor == "") {
                                //roll result from table
                                let featTable = game.tables.entities.find(t => t.name == featTableName);                        
                                if (featTable) {
                                    let resultsleft = 0;
                                    for (let data of featTable.data.results) {
                                        if (!data.drawn) {
                                            resultsleft++;
                                        }
                                    }
                                    if (resultsleft < 1) {
                                        await featTable.reset();
                                    }
                                    let result = featTable.roll().results[0];
                                    featFlavor = result.text;
                                    featTable.updateEmbeddedEntity("TableResult", {
                                        _id: result._id,
                                        drawn: true
                                    });
                                }
                            }

                            let chatMsg = `
                            <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}" data-spell-level="${featData.data.data.level}">
                                <header class="card-header flexrow">
                                    <img src="${featUpdate.img}" title="${featName}" width="36" height="36"/>
                                    <h3 class="item-name">
                                    ${featName}</h3>
                                </header>
                                <div class="card-content">
                                    <p><strong>${featFlavor}</strong></p>
                                    <p><em>${actorData.name} insults ${targetActor.data.name}.</em></p>                                    
                                    <details closed="">
                                        <summary>Toggle description</summary>
                                        ${featUpdate.data.description.value}
                                    </details>
                                </div>
                                <div class="card-buttons">
                                    <button data-action="save" data-ability="wis" disabled">Save DC ${eval(8 + actorData.data.data.attributes.prof + actorData.data.data.abilities[featAbilitySave].mod)} Wisdom</button>
                                </div>
                            </div>
                            `;
                            
                            let dmg = "1d4";
                            if (bardLevel >= 17) {
                                dmg = "4d4";
                            } else if (bardLevel >= 11) {
                                dmg = "3d4";
                            } else if (bardLevel >= 5) {
                                dmg = "2d4";
                            }

                            new Roll(dmg).roll().toMessage({
                                speaker: ChatMessage.getSpeaker(),
                                flavor: chatMsg});    

                            //update actor data
                            featUpdate.data.uses.value = featUpdate.data.uses.value - 1;
                            actorData.updateEmbeddedEntity("OwnedItem", featUpdate);

                            if (effectsOn) {
                                //add effects filter template with Tokenmagic module
                                let params = 
                                [{
                                   filterType: "xbloom",
                                   autoDestroy: true,
                                   threshold: 0.35,
                                   bloomScale: 0,
                                   brightness: 1.2,
                                   blur: 0.1,
                                   padding: 10,
                                   quality: 15,
                                   blendMode: 0,
                                   animated:
                                   {
                                       bloomScale: 
                                       { 
                                          active: true, 
                                          loopDuration: 3040, 
                                          animType: "syncCosOscillation", 
                                          val1: 0, 
                                          val2: 1,
                                          loops: 3
                                       },
                                       threshold:  
                                       { 
                                          active: false, 
                                          loopDuration: 3040, 
                                          animType: "syncCosOscillation", 
                                          val1: 0.05, 
                                          val2: 1.9,
                                          loops: 3
                                       }
                                   },
                                },
                                {
                                    filterType: "oldfilm",
                                    autoDestroy: true,
                                    sepia: 0.9,
                                    noise: 0.3,
                                    noiseSize: 1.0,
                                    scratch: 0.8,
                                    scratchDensity: 0.5,
                                    scratchWidth: 1.2,
                                    vignetting: 0.3,
                                    vignettingAlpha: 0.7,
                                    vignettingBlur: 0.3,
                                    animated:
                                    {
                                        seed:        
                                        { 
                                           active: true, 
                                           animType: "randomNumber", 
                                           val1: 0, 
                                           val2: 1,
                                          loops: 3
                                        },
                                        vignetting:  
                                        { 
                                           active: true, 
                                           animType: "syncCosOscillation" , 
                                           loopDuration: 2000, 
                                           val1: 0.2, 
                                           val2: 0.4,
                                           loops: 3
                                        }
                                    }
                                },
                                {
                                    filterType: "outline",
                                    color: 0x000000,
                                    thickness: 0,
                                }];                      
                                TokenMagic.addFiltersOnSelected(params);
                            }
                        }
                        main();                        
                    }
                }
            }).render(true);            
        } else
            ui.notifications.warn(`Target one token. Double right-click if you're a player or single right-click then select target if you're GM`);
    } else
        ui.notifications.warn(`Selected character must have ${featName} feature.`);
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);