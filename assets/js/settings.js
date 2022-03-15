import Alpine from 'alpinejs'
import CTFd from "./index"
import { serializeJSON } from "@ctfdio/ctfd-js/forms"
import { copyToClipboard } from "./utils/clipboard"

window.Alpine = Alpine

Alpine.data('SettingsForm', () => ({
    success: null,
    error: null,
    initial: null,
    errors: [],

    init() {
        this.initial = serializeJSON(this.$el)
    },

    async updateProfile() {
        this.success = null;
        this.error = null;
        this.errors = [];

        let data = serializeJSON(this.$el, this.initial, true);

        // Process fields[id] to fields: {}
        data.fields = [];
        for (const property in data) {
          if (property.match(/fields\[\d+\]/)) {
            let field = {};
            let id = parseInt(property.slice(7, -1));
            field["field_id"] = id;
            field["value"] = data[property];
            data.fields.push(field);
            delete data[property];
          }
        }

        // Send API request
        let response = await CTFd.pages.settings.updateSettings(data);
        if (response.success) {
            this.success = true;
            this.error = false;
            setTimeout(() => {
                this.success = null;
                this.error = null;
            }, 3000);
        } else {
            this.success = false;
            this.error = true;
            Object.keys(response.errors).map((error) => {
              const error_msg = response.errors[error];
              this.errors.push(error_msg);
            });
        }
    }
}))

Alpine.data('TokensForm', () => ({
    token: null,

    async generateToken() {
        let data = serializeJSON(this.$el);
        if (!data.expiration) {
            delete data.expiration;
        }
        let response = await CTFd.pages.settings.generateToken(data);
        this.token = response.data.value;
    },

    copyToken() {
        copyToClipboard(this.$refs.token);
        let tt = new Tooltip(this.$refs.token, {'placement': 'top'})
        setTimeout(function() {
            tt.hide();
        }, 1500);
    }
}))

Alpine.start()