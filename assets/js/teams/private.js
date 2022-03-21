import $ from "jquery"
import "bootstrap/dist/js/bootstrap.bundle";
import Alpine from 'alpinejs'
import CTFd from "../index"
import { serializeJSON } from "@ctfdio/ctfd-js/forms"
import { copyToClipboard } from "../utils/clipboard"

window.Alpine = Alpine;

Alpine.store('inviteToken', "");

Alpine.data('TeamEditModal', () => ({
    success: null,
    error: null,
    initial: null,
    errors: [],

    init() {
        this.initial = serializeJSON(this.$el.querySelector('form'))
    },

    async updateProfile() {
        let data = serializeJSON(this.$el, this.initial, true);

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

        let response = await CTFd.pages.teams.updateTeamSettings(data);
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
    },
}));

Alpine.data('TeamCaptainModal', () => ({
    success: null,
    error: null,
    errors: [],

    async updateCaptain() {
        let data = serializeJSON(this.$el, null, true);
        let response = await CTFd.pages.teams.updateTeamSettings(data);

        if (response.success) {
            window.location.reload();
        } else {
            this.success = false;
            this.error = true;
            Object.keys(response.errors).map((error) => {
              const error_msg = response.errors[error];
              this.errors.push(error_msg);
            });
        }
    },
}));


Alpine.data('TeamInviteModal', () => ({
    copy() {
        copyToClipboard(this.$refs.link);
    }
}));


Alpine.data('TeamDisbandModal', () => ({
    async disbandTeam() {
        let response = await CTFd.pages.teams.disbandTeam();
        if (response.success) {
            window.location.reload();
        } else {
            alert(response.errors[""].join(" "));
        }
    }
}));

Alpine.data('CaptainMenu', () => ({
    captain: false,

    editTeam() {
        $("#team-edit-modal").modal()
    },
    chooseCaptain() {
        $("#team-captain-modal").modal()
    },
    async inviteMembers() {
        let response = await CTFd.pages.teams.getInviteToken();
        if (response.success) {
            let code = response.data.code;
            let url = `${window.location.origin}${
              CTFd.config.urlRoot
            }/teams/invite?code=${code}`;
            $("#team-invite-modal input[name=link]").val(url);
            $("#team-invite-modal").modal();
            this.$store.inviteToken = url;
            $("#team-invite-modal").modal()
        }
    },
    disbandTeam() {
        $("#team-disband-modal").modal();
    },
}));

Alpine.start()