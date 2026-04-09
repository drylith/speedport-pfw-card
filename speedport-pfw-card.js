// pfw-card.js
class PfwCard extends HTMLElement {
  constructor() {
    super();
    this._blocked = new Set();
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      this.innerHTML = `
          <ha-card>
            <div class="card-header">Port Forwarding</div>
            <div class="card-content" id="pfw-content"></div>
          </ha-card>
        `;
      this.content = this.querySelector("#pfw-content");
    }

    const pfwEntities = Object.entries(hass.states)
      .filter(([id]) => id.startsWith("switch.speedport_pfw"))
      .map(([id, state]) => ({ id, state }));

    this.content.innerHTML =
      pfwEntities.length === 0
        ? `<p style="color: var(--secondary-text-color)">No PFW-entities found.</p>`
        : pfwEntities
            .map(
              ({ id, state }, i) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding: 2px 0">
              <span>
                <ha-icon icon="mdi:wall" style="--mdi-icon-size: 20px; padding-left: 10px; padding-right: 20px; color: ${
                  state.state === "on"
                    ? "var(--state-active-color)"
                    : "var(--state-icon-color)"
                };"></ha-icon>
                <span>${
                  state.attributes.friendly_name
                    .toLowerCase()
                    .replace("speedport", "")
                    .replace("pfw_", "")
                    .trim() || id
                }</span>
              </span>
              <ha-entity-toggle id="toggle-${id.replace(/\./g, "_")}"
                .hass=${hass}
                .stateObj=${state}>
              </ha-entity-toggle>
            </div>
          `
            )
            .join("");

    this.content.querySelectorAll("ha-entity-toggle").forEach((el, i) => {
      el.hass = hass;
      el.stateObj = pfwEntities[i].state;

      el.addEventListener("click", () => {
        const entityId = pfwEntities[i].id;
        this._blocked.add(entityId);
        setTimeout(() => this._blocked.delete(entityId), 2000);
      });
    });
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("pfw-card", PfwCard);
