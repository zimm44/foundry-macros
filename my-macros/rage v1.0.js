//Apply Rage feature to selected character.

//enable effects, requires Tokenmagic module
let effectsOn = true;
const noEffectsIcon = 'icons/svg/explosion.svg';

//set false if you don't want neither effects nor icons to be added after activating the macro
let setEffectsIcon = true;

//must match values in character sheet (if present)
const rageClassName = 'Barbarian';
let featName = "Rage";
//item name for Bear Totem
const bearTotemFeatureName = 'Totem Spirit: Bear';
//rageMsg will be used if flavor is empty
const rageMsg = 'Eyes shining, blood pumping, targets defined! The meat grinder is prepared to scream!'
//change if your barbarian does not use Strength
const strAttacks = true;

//declarations
let rageDmgAdded = false;
let enabled = false;
let confirmed = false;
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
  let actorTokenData = actorData[0];
  actorData = actorData[0].actor;   
  let featData = actorData ? actorData.items.find(i => i.name===featName) : null;
  let featClass = actorData ? actorData.items.find(i => i.name===rageClassName) : null;
  if (featData !== null && featClass !== null) { //if have the required class and feature

    //verify if rage and its damage bonus are active
    if (actorData.data.flags.rageMacro !== null && actorData.data.flags.rageMacro !== undefined) {    
            enabled = true;
            if (actorData.data.flags.rageMacro["rageDmgAdded"] == true) {
                rageDmgAdded = true;
            }
    }

    //calculate rage damage
    let barblvl = featClass.data.data.levels;
    let lvlCorrection =  barblvl === 16 || barblvl === 17 ? 1 : 0;
    let rageDmg = 2 + Math.floor(barblvl / 9) + lvlCorrection;
    let dmg = JSON.parse(JSON.stringify(actorData.data.data.bonuses.mwak.damage));
    
    if (enabled) {
      //if rage is active, disable it
      // reset resistances and melee weapon attack bonus
      let obj = {};
      obj['flags.rageMacro'] = null;
            obj['data.traits.dr'] = actorData.data.flags.rageMacro.oldResistances;                    
      //revert rage global mwak damage bonus to original value
      if(rageDmgAdded) {
        if (dmg == rageDmg || dmg == null || dmg == undefined || dmg == '' || dmg == 0){
          obj['data.bonuses.mwak.damage']='';
        } else {
          let patt = `\\s\\+\\s${rageDmg}($|[^0123456789dkrxcm(@{])`;
          let result = dmg.search(patt);
          if (result !== -1) {
            let len = ('' + rageDmg).length;
            let origDmg = duplicate(dmg);
            let firstHalfDmg = duplicate(dmg).substring(0,result);
            let lastHalfDmg = duplicate(dmg).substring(result+3+len, origDmg.length);
            dmg = `${firstHalfDmg}${lastHalfDmg}`;
            obj['data.bonuses.mwak.damage']=dmg;
          } else {
            ui.notifications.error(`Failed to revert global melee weapon attack bonus, please revert manually.`);
          }
        }
      }
      actorData.update(obj);

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

      let chatMsg = `<div class="dnd5e chat-card item-card"">${actorData.name} is no longer raging.</div>`;
      toChat(chatMsg);

    } else {
      if(featData.data.data.uses.value > 0) { //check if there are uses available
        //if rage is not active, enable it
        let featUpdate = duplicate(featData);
        new Dialog({
        title: `Activating ${featName}`,
        content:`
        <label>Uses left: ${featData.data.data.uses.value}</label>
        <form>
            <div class="form-group">
                <label for="flavor">Flavor speech:</label>
                <input id="flavor" name="flavor" value="${featUpdate.data.chatFlavor}"></input>
            </div>
        </form>
        `,
        buttons: {
        one: {
            icon: '<i class="fas fa-fist-raised"></i>',
            label: "Activate",
            callback: (html) =>
            {
                let rageFlavor = html.find('#flavor')[0].value;
                featUpdate.data.chatFlavor = rageFlavor;
                featUpdate.data.uses.value = featUpdate.data.uses.value - 1;
                actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
                confirmed = true;

                //update resistance
                let obj = {};
                //storing old resistances in flags to restore later
                obj['flags.rageMacro.enabled'] = true;
                obj['flags.rageMacro.oldResistances'] = JSON.parse(JSON.stringify(actorData.data.data.traits.dr));
                //add bludgeoning, piercing and slashing resistance
                let newResistance = duplicate(actorData.data.data.traits.dr);
                if (newResistance.value.indexOf('bludgeoning') === -1) newResistance.value.push('bludgeoning');
                if (newResistance.value.indexOf('piercing') === -1) newResistance.value.push('piercing');
                if (newResistance.value.indexOf('slashing') === -1) newResistance.value.push('slashing');
                //if bear totem, add bear totem resistances.
                let bear = actorData.items.find(i => i.name === `${bearTotemFeatureName}`)
                if (bear !== undefined && bear!== null) {
                if (newResistance.value.indexOf('acid') === -1) newResistance.value.push('acid');
                if (newResistance.value.indexOf('cold') === -1) newResistance.value.push('cold');
                if (newResistance.value.indexOf('fire') === -1) newResistance.value.push('fire');
                if (newResistance.value.indexOf('force') === -1) newResistance.value.push('force');
                if (newResistance.value.indexOf('lightning') === -1) newResistance.value.push('lightning');
                if (newResistance.value.indexOf('necrotic') === -1) newResistance.value.push('necrotic');
                if (newResistance.value.indexOf('poison') === -1) newResistance.value.push('poison');
                if (newResistance.value.indexOf('radiant') === -1) newResistance.value.push('radiant');
                if (newResistance.value.indexOf('thunder') === -1) newResistance.value.push('thunder');
                }
                obj['data.traits.dr'] = newResistance;
                actorData.update(obj);

                //for strength barbarians, update global melee weapon attack bonus to include rage bonus
                if (strAttacks) {
                  obj['flags.rageMacro.rageDmgAdded'] = true;
                  // Preserve old mwak damage bonus if there was one
                  obj['flags.rageMacro.oldDmg'] = JSON.parse(JSON.stringify(dmg));
                  //actually add the bonus rage damage to the previous bonus damage
                  if (dmg == null || dmg == undefined || dmg == 0 || dmg == '') {
                      obj['data.bonuses.mwak.damage'] = rageDmg;
                  } else {
                      obj['data.bonuses.mwak.damage'] = `${dmg} + ${rageDmg}`;
                  }
                  actorData.update(obj);
                }

                //building chat message
                let rageFlavorMsg = "";
                if (rageFlavor !== undefined && rageFlavor !== null && rageFlavor !== "") {
                    rageFlavorMsg = `<p><strong>${rageFlavor}</strong></p>`;
                } else {
                    rageFlavorMsg = `<p><strong>${rageMsg}</strong></p>`;
                }

                let chatMsg = `
                <div class="dnd5e chat-card item-card" data-actor-id="${actorData.id}" data-item-id="${featData.id}" data-spell-level="${featData.data.data.level}">
                  <header class="card-header flexrow">
                      <img src="${featUpdate.img}" title="${featName}" width="36" height="36"/>
                      <h3 class="item-name">
                      ${featName}</h3>
                  </header>
                  <div class="card-content">
                      <p>${actorData.name} enters in ${featName} mode</p>
                      ${rageFlavorMsg}
                      <details closed="">
                      <summary>Toggle description</summary>
                      ${featUpdate.data.description.value} 
                      </details>                    
                  </div>
                </div>
                `;
               
                toChat(chatMsg);
            
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
                      filterType: "fire",
                      intensity: 1,
                      color: 0xFFFFFF,
                      amplitude: 1,
                      time: 0,
                      blend: 2,
                      fireBlend : 1,
                      animated :
                      {
                        time : 
                        { 
                          active: true, 
                          speed: -0.0019, 
                          animType: "move" 
                        },
                        intensity:
                        {
                          active:true,
                          loopDuration: 15485,
                          val1: 0.8,
                          val2: 1,
                          animType: "syncCosOscillation"
                        },
                        amplitude:
                        {
                          active:true,
                          loopDuration: 4567,
                          val1: 0.1,
                          val2: 0.3,
                          animType: "syncCosOscillation"
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
      ui.notifications.warn(`Selected character must be a ${rageClassName} and have ${featName} feature.`);
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);
