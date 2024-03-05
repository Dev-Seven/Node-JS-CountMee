const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function() {
ac.grant("support")
 .readOwn("event")
 .updateOwn("event")

ac.grant("admin")
 .extend("support")
 .readAny("event")

ac.grant("superAdmin")
 .extend("support")
 .extend("admin")
 .updateAny("event")
 .deleteAny("event")

return ac;
})();