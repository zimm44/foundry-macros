//Set Global Modifiers for an Actor

let actorData = canvas.tokens.controlled;

if (actorData.length == 1) { //if only one is selected
  actorData = actorData[0].actor;

  function updateGlobalModifiers(mwakA,mwakD,rwakA,rwakD,msakA,msakD,rsakA,rsakD,gac,gst,gsc,gsdc)
  { 
          let obj = {};

          obj["data.bonuses.mwak.attack"] = mwakA;
          obj["data.bonuses.mwak.damage"] = mwakD;
          obj["data.bonuses.rwak.attack"] = rwakA;
          obj["data.bonuses.rwak.damage"] = rwakD;
          obj["data.bonuses.msak.attack"] = msakA;
          obj["data.bonuses.msak.damage"] = msakD;
          obj["data.bonuses.rsak.attack"] = rsakA;
          obj["data.bonuses.rsak.damage"] = rsakD;
          obj["data.bonuses.abilities.check"] = gac;
          obj["data.bonuses.abilities.save"] = gst;
          obj["data.bonuses.abilities.skill"] = gsc;
          obj["data.bonuses.spell.dc"] = gsdc;

      
          actorData.update(obj);
  }

  function clearAll()
  {
      new Dialog({
          title: "Clear All",
          content: `<p>Are you sure you want to clear all modifiers from selected token?</p>`,
          buttons: {
            one: {
              icon: '<i class="fas fa-eraser"></i>',
              label: "Clear All",
              callback: (html) =>
              {
                  updateGlobalModifiers('','','','','','','','','','','','');
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

  new Dialog({
    title: "Global Modifiers",
    content: `
    <p>Change values to update global modifiers</p>
    <form>
      <div class="form-group">
      <label>Melee Weapon Atk:</label>
      <input type="text" id="mwakA" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.mwak.attack)) + `">
      </div>
      <div class="form-group">
      <label>Melee Weapon Dmg:</label>
      <input type="text" id="mwakD" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.mwak.damage)) + `">
      </div>
      <div class="form-group">
      <label>Ranged Weapon Atk:</label>
      <input type="text" id="rwakA" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.rwak.attack)) + `">
      </div>            
      <div class="form-group">
      <label>Ranged Weapon Dmg:</label>
      <input type="text" id="rwakD" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.rwak.damage)) + `">
      </div>
      <div class="form-group">
      <label>Melee Spell Atk:</label>
      <input type="text" id="msakA" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.msak.attack)) + `">
      </div>
      <div class="form-group">
      <label>Melee Spell Dmg:</label>
      <input type="text" id="msakD" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.msak.damage)) + `">
      </div>
      <div class="form-group">
      <label>Ranged Spell Atk:</label>
      <input type="text" id="rsakA" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.rsak.attack)) + `">
      </div>
      <div class="form-group">
      <label>Ranged Spell Dmg:</label>
      <input type="text" id="rsakD" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.rsak.damage)) + `">
      </div>
      <div class="form-group">
      <label>Ability Check:</label>
      <input type="text" id="gac" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.abilities.check)) + `">
      </div>     
      <div class="form-group">
      <label>Saving Throw:</label>
      <input type="text" id="gst" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.abilities.save)) + `">
      </div>     
      <div class="form-group">
      <label>Skill Check:</label>
      <input type="text" id="gsc" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.abilities.skill)) + `">
      </div>     
      <div class="form-group">
      <label>Spell DC:</label>
      <input type="text" id="gsdc" value="` + JSON.parse(JSON.stringify(actorData.data.data.bonuses.spell.dc)) + `">
      </div>                                                           
    </form>
    `,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: "Confirm",
        callback: (html) =>
        {
            updateGlobalModifiers(
                html.find('[id=mwakA]')[0].value,
                html.find('[id=mwakD]')[0].value,
                html.find('[id=rwakA]')[0].value,
                html.find('[id=rwakD]')[0].value,
                html.find('[id=msakA]')[0].value,
                html.find('[id=msakD]')[0].value,
                html.find('[id=rsakA]')[0].value,
                html.find('[id=rsakD]')[0].value,
                html.find('[id=gac]')[0].value,
                html.find('[id=gst]')[0].value,
                html.find('[id=gsc]')[0].value,
                html.find('[id=gsdc]')[0].value
            );
        }
      },
      two: {
        icon: '<i class="fas fa-eraser"></i>',
        label: "Clear All",
        callback: (html) =>
        {
            clearAll();
        }          
      },
      three: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    },
    default: "Cancel"
  }).render(true);
} else if (actorData.length > 1)
  ui.notifications.warn(`Select only one token.`);
else
  ui.notifications.warn(`Select one token.`);