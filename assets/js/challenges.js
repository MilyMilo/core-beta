import $ from "jquery"
import "bootstrap/dist/js/bootstrap.bundle";
import Alpine from 'alpinejs'
import CTFd from "./index"
import { serializeJSON } from "@ctfdio/ctfd-js/forms"
import { copyToClipboard } from "./utils/clipboard"
import { submitChallenge } from "@ctfdio/ctfd-js/pages/challenge";

window.Alpine = Alpine;

Alpine.store('challenge', {
    data: null,
});

Alpine.data('Challenge', () => ({
    id: null,
    submission: null,
    solves: [],
    response: null,

    async showChallenge() {
        $(this.$el).tab('show');
    },
    async showSolves() {
        this.solves = await CTFd.pages.challenge.loadSolves(this.id);
        $(this.$el).tab('show');
    },
    async submitChallenge() {
        this.response = await CTFd.pages.challenge.submitChallenge(this.id, this.submission);
    },
}));

Alpine.data('ChallengeBoard', () => ({
    loaded: false,
    challenges: [],
    challenge: null,

    async init() {
        this.challenges = await CTFd.pages.challenges.getChallenges();
        this.loaded = true;
    },

    getCategories() {
        let categories = [];
        this.challenges.forEach(challenge => {
            if (!categories.includes(challenge.category)){
                categories.push(challenge.category);
            }
        });
        return categories;
    },

    getChallenges(category) {
        if (category) {
            return this.challenges.filter(challenge => challenge.category === category);
        } else {
            return this.challenges;
        }
    },

    async loadChallenge(challengeId) {
        await CTFd.pages.challenge.displayChallenge(challengeId, (challenge) => {
            Alpine.store('challenge').data = challenge.data;
            // Alpine.mutateDom(() => {
            //     document.body.querySelectorAll('[x-cloak]').forEach((el) => {
            //       el.setAttribute('data-alpine-was-cloaked', el.getAttribute('x-cloak') ?? '')
            //     })
            //   })
            // Alpine.mutateDom(() => {})
            $('#challenge-window').modal()
        });
    }
}));

Alpine.start()