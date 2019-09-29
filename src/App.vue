<template>
    <div class="container mx-auto py-4">
        <Login v-if="!loggedIn" @loggedIn="handleLoggedIn()"></Login>
        <Messages v-else></Messages>
    </div>
</template>

<script>
    import Login from "./components/Login";
    import Messages from "./components/Messages";

    export default {
        name: 'app',

        components: {
            Login,
            Messages,
        },

        data() {
            return {
                loggedIn: false,
            };
        },

        /**
         * Determine if the user is already logged in.
         */
        mounted() {
            this.loggedIn = !!this.$cookies.get('token');
        },

        methods: {
            /**
             * Handle what happens after the user logs in.
             */
            handleLoggedIn() {
                this.loggedIn = true;
            }
        },
    };
</script>

<style>
    html, body {
        height: 100%;
    }
</style>
