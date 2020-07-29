//Apply Lay on Hands feature to a target character.
//How to use: Select only one token that have Lay on Hands (equal to 'featName') and mark a target.
//If you have control over the target, the heal will be applied, otherwise the GM or the player will have to do it manually

let confirmed = false;

//enable effects, requires Tokenmagic module
let effectsOn = true;

//edit if required, must be equal to character sheet
let featName = "Lay on Hands";
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
            if(featData.data.data.uses.value > 0) { //check if there are uses available  

                let featUpdate = duplicate(featData);
                let targetActor = game.user.targets.values().next().value.actor;
                let maxUses = featUpdate.data.uses.value;
                let maxHeal = Math.clamped(maxUses, 0, targetActor.data.data.attributes.hp.max - targetActor.data.data.attributes.hp.value);
                const cureNumber = 5;          

                let content = `<p><em>${actorData.name} prepares to lay hands on ${targetActor.data.name}.</em></p>
                                <form>
                                    <div class="form-group">
                                        <label for="flavor">Flavor speech:</label>
                                        <input id="flavor" name="flavor" value="${featUpdate.data.chatFlavor}"></input>
                                    </div>                    
                                    <div class="form-group">
                                        <label for="num">Restore HP (Max: ${maxHeal}):</label>
                                        <input id="num" name="num" type="number" min="1" max="${maxHeal}" value="1"></input>
                                    </div>
                                </form>
                                <p>Curing poison or disease will always consume ${cureNumber} uses.</p>
                                <p><strong>You have ${maxUses} uses remaining before resting.</strong></p>
                                `;
                new Dialog({
                    title: "Lay on Hands Healing",
                    content: content,      
                    buttons: {     
                        one: {
                            icon: '<i class="fas fa-plus"></i>',
                            label: "Heal",
                            callback: (html) =>               
                            {
                                //heal button function
                                let number = Math.floor(Number(html.find('#num')[0].value));
                                if (number > 0 && maxHeal >= number && maxHeal > 0) {

                                    let chatMsg = `
                                    <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}" data-spell-level="${featData.data.data.level}">
                                        <header class="card-header flexrow">
                                            <img src="${featUpdate.img}" title="${featName}" width="36" height="36"/>
                                            <h3 class="item-name">
                                            ${featName}</h3>
                                        </header>
                                        <div class="card-content">
                                            <p>${actorData.name} lays hands on ${targetActor.data.name} for ${number} HP.</p>
                                            <p><strong>${html.find('#flavor')[0].value}</strong></p>
                                            <details closed="">
                                            <summary>Toggle description</summary>
                                            ${featUpdate.data.description.value}
                                            </details>                                            
                                        </div>
                                    </div>
                                    `;

                                    if (targetActor.permission !== CONST.ENTITY_PERMISSIONS.OWNER) {
                                        //not allowed to apply healing
                                        new Roll(`${number}`).roll().toMessage({
                                            speaker: ChatMessage.getSpeaker(),
                                            flavor: chatMsg});
                                    } else {
                                        //allowed to apply healing
                                        toChat(chatMsg);
                                        game.actors.find(a => a._id===targetActor._id).update( {
                                            "data.attributes.hp.value" : targetActor.data.data.attributes.hp.value + number
                                        });
                                    }

                                    //update actor data
                                    featUpdate.data.uses.value = featUpdate.data.uses.value - number;
                                    featUpdate.data.chatFlavor = html.find('#flavor')[0].value;
                                    actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
                                    
                                    confirmed = true;

                                } else if (number > maxUses) {
                                    ui.notifications.warn(`You don't have this amount of charges left.`);
                                } else if (maxHeal == 0) {
                                    ui.notifications.warn(`Your target's HP is already full.`);
                                } else if (number > maxHeal) {
                                    ui.notifications.warn(`Your target's missing less HP than you're trying to heal.`);                                
                                } else ui.notifications.warn(`You must inform the amount of charges to be used.`);
                            }
                        },
                        two: {
                            icon: '<i class="fas fa-medkit"></i>',
                            label: "Cure",
                            callback: (html) =>               
                            {
                                //cure poison disease button function                  
                                if (maxUses >= cureNumber) {

                                    let chatMsg = `
                                    <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}" data-spell-level="${featData.data.data.level}">
                                        <header class="card-header flexrow">
                                            <img src="${featUpdate.img}" title="${featName}" width="36" height="36"/>
                                            <h3 class="item-name">
                                            ${featName}</h3>
                                        </header>
                                        <div class="card-content">
                                            <p>${actorData.name} lays hands on ${targetActor.data.name} and cures one poison or disease.</p>
                                            <p><strong>${html.find('#flavor')[0].value}</strong></p>
                                            <details closed="">
                                            <summary>Toggle description</summary>
                                            ${featUpdate.data.description.value}
                                            </details>
                                        </div>
                                    </div>
                                    `;

                                    toChat(chatMsg);

                                    //update actor data
                                    featUpdate.data.uses.value = featUpdate.data.uses.value - cureNumber;
                                    featUpdate.data.chatFlavor = html.find('#flavor')[0].value;
                                    actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
                                    
                                    confirmed = true;

                                } else ui.notifications.warn(`You don't have this amount of charges left. Each cure poison or disease costs 5 charges.`);
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
                            if (effectsOn) {
                                //add effects filter template with Tokenmagic module
                                let params = 
                                [{
                                    filterType: "xbloom",
                                    threshold: 0.35,
                                    bloomScale: 0,
                                    brightness: 1.2,
                                    blur: 0.1,
                                    padding: 10,
                                    quality: 15,
                                    blendMode: 0,
                                    autoDestroy: true,
                                    animated:
                                    {
                                        bloomScale: 
                                        { 
                                            active: true, 
                                            loopDuration: 3000, 
                                            loops: 4,
                                            animType: "syncCosOscillation", 
                                            val1: 0, 
                                            val2: 2
                                        },
                                        threshold:  
                                        { 
                                            active: false, 
                                            loopDuration: 3000, 
                                            loops: 4,
                                            animType: "syncCosOscillation", 
                                            val1: 0.05, 
                                            val2: 1.9
                                        }
                                    }
                                }];                        
                                TokenMagic.addFiltersOnSelected(params);
                            }
                        }
                    }
                }).render(true);            
            } else
                ui.notifications.warn(`${actorData.name} does not have any uses of ${featName} left.`);
        } else
            ui.notifications.warn(`Target one token. Double right-click if you're a player or single right-click then select target if you're GM`);
    } else
        ui.notifications.warn(`Selected character must have ${featName} feature.`);
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);