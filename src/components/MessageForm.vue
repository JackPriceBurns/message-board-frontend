<template>
    <div class="rounded shadow-md mb-8 px-6 py-4">
        <div class="w-full">
            <div class="py-3 w-full">
                    <textarea
                            class="bg-gray-200 appearance-none border border-gray-200 block rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white"
                            v-model="message"
                            rows="3"
                            placeholder="What's on your mind?">
                    </textarea>
            </div>
        </div>

        <div class="text-right">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="sendMessage()">
                Post
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MessageForm',

        data() {
            return {
                message: ''
            };
        },

        methods: {
            /**
             * Create a new message.
             */
            async sendMessage() {
                if (!this.message) {
                    alert('Please type a message.');

                    return;
                }

                let data = {message: this.message};

                try {
                    let response = await this.axios.post('/api/messages', data);

                    this.$emit('messageCreated', response.data.data);
                } catch (error) {
                    console.log(error);

                    alert('Error occurred posting message.')
                }
            }
        },
    };
</script>
