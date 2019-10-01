<template>
    <div class="container mx-auto py-4">
        <Login v-if="!loggedIn" @loggedIn="handleLoggedIn()"></Login>
        <Messages v-else @loggedOut="handleLoggedOut()" :token="token"></Messages>
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
                token: null,
                loggedIn: false,
            };
        },

        /**
         * Determine if the user is already logged in.
         */
        mounted() {
            if (this.$cookies.get('token')) {
                this.handleLoggedIn();

                return;
            }

            this.handleLoggedOut();
        },

        methods: {
            /**
             * Handle what happens after the user logs in.
             */
            handleLoggedIn() {
                this.token = this.$cookies.get('token');

                if (!this.token) {
                    alert('Something went wrong fetching token.');

                    return;
                }

                this.setAxiosHeader(this.token);

                this.loggedIn = true;
            },

            /**
             * Handle what happens after the user logs in.
             */
            handleLoggedOut() {
                this.token = null;
                this.loggedIn = false;
            },

            /**
             * Set the Authorization for axios requests.
             */
            setAxiosHeader(token) {
                this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            }
        },
    };
</script>
