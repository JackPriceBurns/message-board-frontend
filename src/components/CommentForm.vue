<template>
    <div>
        <div class="flex mt-2" v-if="commenting">
            <div class="w-5/6 pr-2">
                <input class="bg-gray-200 appearance-none border border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white"
                       type="text"
                       v-model="comment"
                       placeholder="Comment...">
            </div>

            <div class="w-1/6 pl-2">
                <button class="bg-blue-500 hover:bg-blue-700 w-full text-white font-bold py-2 rounded"
                        @click="sendComment()">
                    Send
                </button>
            </div>
        </div>

        <div v-else>
            <span class="font-bold cursor-pointer" @click="commenting = true">Add Comment</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'CommentForm',

        props: {
            message: {
                type: Object,
                required: true,
            },
        },

        data() {
            return {
                comment: '',
                commenting: false,
            };
        },

        methods: {
            /**
             * Create a new comment on the backend.
             */
            async sendComment() {
                if (!this.comment) {
                    alert('Please type a comment.');

                    return;
                }

                let data = {
                    message: this.comment,
                    message_id: this.message.id,
                };

                try {
                    let response = await this.axios.post('/api/comments', data);

                    this.$emit('commentCreated', response.data.data);
                    this.comment = '';
                } catch (error) {
                    alert('An unknown error occurred creating comment.');
                }
            },
        },
    };
</script>
