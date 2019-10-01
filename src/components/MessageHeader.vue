<template>
    <div class="flex">
        <div class="w-1/2">
            <h1 class="text-xl mb-4">Messages</h1>
        </div>

        <div class="w-1/2 text-right">
            <span class="text-md font-bold mb-4 cursor-pointer" @click="logout()">Logout</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MessageHeader',

        methods: {
            /**
             * Log out the current user.
             *
             * @returns {Promise<void>}
             */
            async logout() {
                this.$cookies.remove('token');
                this.$emit('loggedOut');
            }
        },
    };
</script>
