//Clone compendiums by writting the name of source compendium and the one you want to receive all the values from it

(function ()
{

    function transferCompendium(source, target)
    {

        const sourceCompendiumName = source;
        const targetCompendiumName = target;

        const process = async (sourceCompendiumName, targetCompendiumName) => {
        const sourceCompendium = game.packs.find(pack => pack.metadata.label === sourceCompendiumName);
        const targetCompendium = game.packs.find(pack => pack.metadata.label === targetCompendiumName);
        if (!sourceCompendium) {
            console.error("Source target compendium invalid");
            return;
        }
        if (!targetCompendium) {
            console.error("Target target compendium invalid");
            return;
        }

        const sourceIndex = await sourceCompendium.getIndex();
        const targetIndex = await targetCompendium.getIndex();

        // start copying
        sourceIndex.forEach(entry => {
            if (!targetIndex.find(e => e.name === entry.name)) {
            console.log("Copying " + entry.name);
            sourceCompendium.getEntity(entry._id).then(entity => {
                console.log("Importing " + entity.name);
                targetCompendium.importEntity(entity);
            });
            } else {
            console.log("Not importing duplicate " + entry.name);
            }
        });
        };

        process(sourceCompendiumName, targetCompendiumName);

    }

  new Dialog({
    title: "Select Compendiums",
    content: `
     <p>Select compendiums source and target to copy</p>
     <form>
      <div class="form-group">
       <label>Source:</label>
       <input type="text" id="source-compendium">
      </div>
      <div class="form-group">
       <label>Target:</label>
       <input type="text" id="target-compendium">
      </div>
     </form>
     `,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: "Confirm",
        callback: (html) =>
        {
            const sourceCompendiumName = html.find('[id=source-compendium]')[0].value;
            const targetCompendiumName = html.find('[id=target-compendium]')[0].value;
            transferCompendium(sourceCompendiumName, targetCompendiumName);
        }
      },
      two: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
      }
    },
    default: "Cancel"
  }).render(true);
  
})();