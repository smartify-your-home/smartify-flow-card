"""One-click setup for Smartify Flow Card."""

from homeassistant import config_entries

from .const import DOMAIN, NAME


class SmartifyFlowCardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Create a single config entry without credentials or sensors."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Add integration from Settings > Devices & services."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        if user_input is not None:
            return self.async_create_entry(title=NAME, data={})
        return self.async_show_form(step_id="user")
