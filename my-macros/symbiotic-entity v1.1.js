//Apply Symbiotic Entity effects including Halo of Spores extra dice and Melee Bonus damage
//Requires that the actor have the class and features named similar to the variables on top of the macro

//enable effects, requires Magic FX module module
let effectsOn = true;
//icon to appear on token if effectsOn is turned off
const noEffectsIcon = 'icons/svg/oak.svg';
//set false if you don't want neither effects nor icons to be added after activating the macro
let setEffectsIcon = true;

//edit if required, must be equal to character sheet
//symbiotic entity feature name
let featName = "Symbiotic Entity";
//wild shape feature name
let featConsumeName = "Wild Shape";
//halo of spores feature name
let featSecondaryEffectName = "Halo of Spores";
//class name to verify the level
let symbioticClassName = "Druid";


//don't change anything from this point unless you are sure about what you're doing
//declarations
let actorData = canvas.tokens.controlled;
let symbioticDmgAdded = false;
let confirmed = false;
let enabled = false;
let symbioticDmg = "1d6";
let symbioticDmg2 = "2d";
let baseHPTemp = 4;

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
    let actorTokenData = actorData[0];
    actorData = actorData[0].actor;
    let featData = actorData ? actorData.items.find(i => i.name===featName) : null;
    let featClass = actorData ? actorData.items.find(i => i.name===symbioticClassName) : null;
    let featConsume = actorData ? actorData.items.find(i => i.name===featConsumeName) : null;
    let featSecondaryEffect = actorData ? actorData.items.find(i => i.name===featSecondaryEffectName) : null;
    if (featData !== null && featClass !== null && featConsume !== null && featSecondaryEffect !== null) { //if have the required feature
        
            let dmg = JSON.parse(JSON.stringify(actorData.data.data.bonuses.mwak.damage));
            let dmg2 = JSON.parse(JSON.stringify(featSecondaryEffect.data.data.damage.parts[0][0]));
            let currentHPTemp = actorData.data.data.attributes.hp.temp;
            let featSecondaryEffectUpdate = duplicate(featSecondaryEffect);
            if (currentHPTemp == null || currentHPTemp == undefined || currentHPTemp == "")
                currentHPTemp = '0';
            //verify if symbiotic entity and its damage bonus are active
            if (actorData.data.flags.symbioticMacro !== null && actorData.data.flags.symbioticMacro !== undefined) {    
                enabled = true;
                if (actorData.data.flags.symbioticMacro["symbioticDmgAdded"] == true) {
                    symbioticDmgAdded = true;
                }
            }
            
            if (enabled) {
                //if symbiotic entity is active, disable it
                //reset melee weapon attack and halo of spores bonus
                let obj = {};
                obj['flags.symbioticMacro'] = null;
                if(symbioticDmgAdded) {
                    if (dmg == symbioticDmg || dmg == null || dmg == undefined || dmg == '' || dmg == 0){
                        obj['data.bonuses.mwak.damage']='';
                    } else {
                        let patt = `\\s\\+\\s${symbioticDmg}($|[^0123456789dkrxcm(@{])`;
                        let result = dmg.search(patt);
                        if (result !== -1) {
                            let len = ('' + symbioticDmg).length;
                            let origDmg = duplicate(dmg);
                            let firstHalfDmg = duplicate(dmg).substring(0,result);
                            let lastHalfDmg = duplicate(dmg).substring(result+3+len, origDmg.length);
                            dmg = `${firstHalfDmg}${lastHalfDmg}`;
                            obj['data.bonuses.mwak.damage']=dmg;
                        } else {
                            ui.notifications.error(`Failed to revert global melee weapon attack bonus, please revert manually.`);
                        }
                    }
                    featSecondaryEffectUpdate.data.damage.parts[0][0] = dmg2.replace(symbioticDmg2, "1d");
                    actorData.updateEmbeddedEntity("OwnedItem", featSecondaryEffectUpdate);
                }
                actorData.update(obj);

                confirmed = true;
                let content = `<p>Your ${featName} has been deactivated.<br></p>
                                <p>Do you want to keep your current <strong>${currentHPTemp}</strong> temporary HP?</p>
                                <p><strong>Keep it only if the current source is not ${featName}.</strong></p>
                                `;
                new Dialog({
                    title: `${featName} temporary HP`,
                    content: content,      
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Remove"          
                        },
                        two: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Keep",
                            callback: (html) =>               
                            {
                                confirmed = false;
                            }                                          
                        }  
                    },
                    default: "Remove",
                    close: html => {

                        if (confirmed) {
                            let tempHPUpdate = actorData;
                            tempHPUpdate.data.data.attributes.hp.temp = null;
                            actorData.updateEmbeddedEntity("OwnedItem", tempHPUpdate);  
                        }                    

                        if (setEffectsIcon) {
                            if (effectsOn) {
                                //delete all filters on the selected tokens/tiles
                                TokenMagic.deleteFiltersOnSelected();
                            } else {
                                //remove icon from token
                                if (actorTokenData.data.effects.includes(noEffectsIcon)) {
                                    actorTokenData.toggleEffect(noEffectsIcon);
                                }
                            }
                        }
                        
                        let chatMsg = `<div class="dnd5e chat-card item-card"">${actorData.name} is no longer under the effects of ${featName}.</div>`;
                        toChat(chatMsg);
                    }
                }).render(true);  



            
            } else {
                if(featConsume.data.data.uses.value > 0) { //check if there are uses available
                //if symbiotic entity is not active, enable it
                let featUpdate = duplicate(featData);
                let featConsumeUpdate = duplicate(featConsume);

                let maxUses = actorData.items.find(i => i.name===featConsumeName).data.data.uses.value;
                baseHPTemp = baseHPTemp * Number(actorData.items.find(i => i.name===symbioticClassName).data.data.levels);
                if (currentHPTemp == null || currentHPTemp == undefined)
                    currentHPTemp = "0";
                    
                let content = `<p>Your current temporary HP is <strong>${currentHPTemp}</strong> and will be swaped to <strong>${baseHPTemp}</strong>.</p>
                                <form>
                                    <div class="form-group">
                                        <label>Flavor speech:</label>
                                        <input id="flavor" value="${featUpdate.data.chatFlavor}"></input>
                                    </div>                    
                                </form>
                                <p><strong>You have ${maxUses} uses remaining before resting.</strong></p>
                                `;
                new Dialog({
                    title: `Activating ${featName}`,
                    content: content,      
                    buttons: {     
                        one: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Use",
                            callback: (html) =>               
                            {
                                //button function

                                let chatMsg = `
                                <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}">
                                    <header class="card-header flexrow">
                                        <img src="${featUpdate.img}" title="${featName}" width="36" height="36"/>
                                        <h3 class="item-name">
                                        ${featName}</h3>
                                    </header>
                                    <div class="card-content">
                                        <p>${actorData.name} is entering in Symbiotic state! ${featName}.</p>
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
                                let tempHPUpdate = actorData;
                                tempHPUpdate.data.data.attributes.hp.temp = baseHPTemp;
                                actorData.updateEmbeddedEntity("OwnedItem", tempHPUpdate);          
                                featConsumeUpdate.data.uses.value = featConsumeUpdate.data.uses.value - 1;
                                actorData.updateEmbeddedEntity("OwnedItem", featConsumeUpdate);
                                featUpdate.data.chatFlavor = html.find('#flavor')[0].value;
                                actorData.updateEmbeddedEntity("OwnedItem", featUpdate);

                                confirmed = true;

                                //update global melee weapon attack bonus damage
                                let obj = {};
                                obj['flags.symbioticMacro.enabled'] = true;
                                obj['flags.symbioticMacro.symbioticDmgAdded'] = true;
                                // Preserve old mwak damage bonus if there was one
                                obj['flags.symbioticMacro.oldDmg'] = JSON.parse(JSON.stringify(dmg));
                                //actually add the mwak bonus to the previous bonus
                                if (dmg == null || dmg == undefined || dmg == 0 || dmg == '') {
                                    obj['data.bonuses.mwak.damage'] = symbioticDmg;
                                } else {
                                    obj['data.bonuses.mwak.damage'] = `${dmg} + ${symbioticDmg}`;
                                }
                                actorData.update(obj);
                                //update halo of spores damage
                                dmg2 = featSecondaryEffectUpdate.data.damage.parts[0][0];
                                featSecondaryEffectUpdate.data.damage.parts[0][0] = dmg2.replace("1d", symbioticDmg2);
                                actorData.updateEmbeddedEntity("OwnedItem", featSecondaryEffectUpdate);
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
                            if (setEffectsIcon) {
                                if (effectsOn) {
                                    //add effects filter template with Tokenmagic module                       
                                    let params = 
                                    [{
                                        filterType: "bevel",
                                        rotation: 0,
                                        thickness: 4,
                                        lightColor: 0x00FF00,
                                        lightAlpha: 0.7,
                                        shadowColor: 0xFF0000,
                                        shadowAlpha: 0.4,
                                        animated :
                                        {
                                        rotation: 
                                        { 
                                            active: true,
                                            clockWise: true, 
                                            loopDuration: 5000, 
                                            animType: "rotation", 
                                        }
                                        }
                                    }];                       
                                    TokenMagic.addFiltersOnSelected(params);
                                } else {
                                    //add icon to token
                                    if (!actorTokenData.data.effects.includes(noEffectsIcon)) {
                                    actorTokenData.toggleEffect(noEffectsIcon);
                                    }
                                }  
                            }
                        }
                    }
                }).render(true);  
            } else
                ui.notifications.warn(`${actorData.name} does not have any uses of ${featName} left.`);                
        }          
    } else
        ui.notifications.warn(`Selected character must be a ${symbioticClassName} that have ${featName}, ${featConsumeName} and ${featSecondaryEffectName} features.`);
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);