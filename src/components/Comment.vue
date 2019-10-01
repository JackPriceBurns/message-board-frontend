<template>
    <div>
        <hr>

        <div class="flex mt-4">
            <div>
                <img :src="comment.user.email | gravatarPicture(40)"
                     class="rounded-full mr-2"
                     alt="profile picture">
            </div>

            <div class="w-full">
                <div class="flex">
                    <div class="w-1/2">
                        <span class="font-bold">{{ comment.user.name }}</span>

                        <span class="text-gray-600 ml-1 text-sm">
                            {{ comment.created_at | dateFormat }}
                        </span>
                    </div>

                    <div class="w-1/2 text-right">
                        <span class="cursor-pointer" @click="deleteComment()">&#10006;</span>
                    </div>
                </div>

                <div class="py-2">{{ comment.message }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Comment',

        props: {
            comment: {
                type: Object,
                required: true,
            },
        },

        methods: {
            /**
             * Delete the comment.
             */
            async deleteComment() {
                try {
                    await this.axios.delete('/api/comments/' + this.comment.id);

                    this.$emit('commentDeleted', this.comment);
                } catch (error) {
                    alert('An unknown error occurred deleting the comment.')
                }
            },
        },
    };
</script>
