<template>
    <div class="flex">
        <div>
            <img :src="message.user.email | gravatarPicture(60)"
                 class="rounded-full mr-4"
                 alt="profile picture">
        </div>

        <div class="w-full">
            <div class="flex">
                <div class="w-1/2">
                    <div><span class="font-bold">{{ message.user.name }}</span></div>
                    <div><span class="text-gray-600">{{ message.created_at | dateFormat }}</span></div>
                </div>

                <div class="w-1/2 text-right">
                    <span class="cursor-pointer" @click="deleteMessage()">Delete</span>
                </div>
            </div>

            <div class="py-3">
                {{ message.message }}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Message',

        props: {
            message: {
                type: Object,
                required: true,
            },
        },

        methods: {
            /**
             * Delete the message.
             */
            async deleteMessage() {
                try {
                    await this.axios.delete('/api/messages/' + this.message.id);

                    this.$emit('messageDeleted', this.message);
                } catch (error) {
                    alert('An unknown error occurred deleting the message.')
                }
            },
        },
    };
</script>
