module.exports = {
  Message, fromDTO, toDTO
};

/**
 * Message object constructor
 *
 * @param from_user - integer, foreign key of user that created the message
 * @param message_text - string, the message content itself
 * @param created_on - long timestamp, the creation moment. Timestamp because issues appear to happen with timezones
 * @param mention_user_id - optional integer, foreign key of user that is mentioned in this message
 * @constructor
 */
function Message(from_user, message_text, created_on, mention_user_id) {
  this.id = undefined;
  this.from_user = from_user;
  this.message_text = message_text;
  this.created_on = created_on;
  this.mention_user_id = mention_user_id;
}

/**
 * The DTO methods handle date issues that arise when sending the message object from the client to the server.
 * Zone data is lost and the date ends up getting changed when reloading past messages.
 */

function fromDTO(msg) {
  const dto = new Message(msg.from_user, msg.message_text, new Date(msg.created_on), msg.mention_user_id);
  dto.id = msg.id;
  return dto;
}

function toDTO(msg) {
  const dto = new Message(msg.from_user, msg.message_text, msg.created_on.getTime(), msg.mention_user_id);
  dto.id = msg.id;
  return dto;
}
