//Open a journal note and paste it's image to chat

let journalCheck = game.journal.find(journal => journal.sheet.rendered);

if (journalCheck !== null) {
  let imageUrl = game.journal.find(journal => journal.sheet.rendered).data.img;
  if (imageUrl !== null && imageUrl !== undefined && imageUrl !== "") {
    ChatMessage.create({
      user: game.user._id,
      content: `<img src="${imageUrl}" />`,
      type: CONST.CHAT_MESSAGE_TYPES.OOC
    });
  } else ui.notifications.warn(`This journal does not have an image set.`);
} else ui.notifications.warn(`Open one journal first.`);